/**
 * Cursor postToolUse hook: after a successful TodoWrite, if todos just transitioned
 * to "all completed", run the repo context engine (scan + generate).
 *
 * stdin: Cursor hook JSON (see https://cursor.com/docs/hooks)
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT_ENV = 'CONTEXT_ENGINE_HOOK_ROOT';

function readStdin() {
  try {
    return readFileSync(0, 'utf8');
  } catch {
    return '';
  }
}

function safeConvPath(conversationId) {
  return String(conversationId)
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .slice(0, 96);
}

function loadJson(path, fallback) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function allTodosCompleted(todosMap) {
  const list = Object.values(todosMap);
  if (list.length === 0) return false;
  return list.every((t) => t && t.status === 'completed');
}

function pyLauncher() {
  const candidates = [];
  if (process.platform === 'win32') candidates.push(['py', '-3']);
  candidates.push(['python3'], ['python']);
  for (const c of candidates) {
    const r = spawnSync(c[0], [...c.slice(1), '-c', 'print(1)'], { encoding: 'utf8' });
    if (r.status === 0) return c;
  }
  return ['python'];
}

function runContextEngine(workspace) {
  const pyCode = `
import os, subprocess, sys
from pathlib import Path
ROOT = Path(os.environ['${ROOT_ENV}']).resolve()
os.chdir(ROOT)
sys.path.insert(0, str(ROOT / 'tools' / 'context-engine'))
try:
    from context_engine.cli import app
except ImportError:
    try:
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', '-e', './tools/context-engine'])
    except subprocess.CalledProcessError:
        subprocess.run([sys.executable, '-m', 'ensurepip', '-q', '--upgrade'], check=False)
        subprocess.check_call([sys.executable, '-m', 'pip', 'install', '-q', '-e', './tools/context-engine'])
    from context_engine.cli import app
sys.argv = ['context-engine', 'scan']
app()
sys.argv = ['context-engine', 'generate']
app()
`;

  const launcher = pyLauncher();
  const r = spawnSync(launcher[0], [...launcher.slice(1), '-c', pyCode], {
    cwd: workspace,
    encoding: 'utf8',
    stdio: ['ignore', 'inherit', 'inherit'],
    env: { ...process.env, [ROOT_ENV]: workspace },
  });
  if (r.status !== 0) {
    console.error(`[context-engine-hook] Python context-engine run failed (code ${r.status}).`);
    return false;
  }
  return true;
}

const raw = readStdin();
let payload;
try {
  payload = JSON.parse(raw || '{}');
} catch {
  process.exit(0);
}

if (payload.tool_name !== 'TodoWrite') process.exit(0);

const workspace =
  (Array.isArray(payload.workspace_roots) && payload.workspace_roots[0]) || payload.cwd || process.cwd();
const conversationId = payload.conversation_id || 'default';

const toolInput = payload.tool_input || {};
const merge = Boolean(toolInput.merge);
const incoming = Array.isArray(toolInput.todos) ? toolInput.todos : [];

const cacheDir = join(workspace, '.cursor', 'hooks', 'cache');
mkdirSync(cacheDir, { recursive: true });
const statePath = join(cacheDir, `todo-state-${safeConvPath(conversationId)}.json`);

const prev = loadJson(statePath, { todos: {}, prevAllDone: false });
const prevTodos = merge && prev.todos && typeof prev.todos === 'object' ? { ...prev.todos } : {};
if (!merge) {
  Object.keys(prevTodos).forEach((k) => delete prevTodos[k]);
}

for (const t of incoming) {
  if (t && typeof t.id === 'string') {
    prevTodos[t.id] = { id: t.id, status: String(t.status || ''), content: t.content };
  }
}

const prevAllDone = prev.prevAllDone === true;
const nowAllDone = allTodosCompleted(prevTodos);

if (nowAllDone && !prevAllDone) {
  runContextEngine(workspace);
}

writeFileSync(statePath, JSON.stringify({ todos: prevTodos, prevAllDone: nowAllDone }));

process.exit(0);
