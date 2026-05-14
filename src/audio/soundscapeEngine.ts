import { evolutionPulseLinear01 } from './evolutionSoundPulse';
import { typeCarrierHz } from './soundscapeTypeProfile';
import type { SoundscapeDriverState } from './soundscapeTypes';

function pickAudioContextCtor(): (typeof AudioContext) | null {
  if (typeof globalThis === 'undefined') return null;
  const g = globalThis as typeof globalThis & {
    AudioContext?: typeof AudioContext;
    webkitAudioContext?: typeof AudioContext;
  };
  return g.AudioContext ?? g.webkitAudioContext ?? null;
}

function createNoiseBuffer(ctx: AudioContext, seconds = 2): AudioBuffer {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  for (let i = 0; i < frames; i += 1) {
    ch[i] = Math.random() * 2 - 1;
  }
  return buf;
}

function createBrownishBuffer(ctx: AudioContext, seconds = 2.5): AudioBuffer {
  const frames = Math.max(1, Math.floor(ctx.sampleRate * seconds));
  const buf = ctx.createBuffer(1, frames, ctx.sampleRate);
  const ch = buf.getChannelData(0);
  let acc = 0;
  for (let i = 0; i < frames; i += 1) {
    const white = Math.random() * 2 - 1;
    acc = (acc + white * 0.02) * 0.995;
    ch[i] = Math.max(-1, Math.min(1, acc * 6));
  }
  return buf;
}

function hashRegionDetune(regionId: string | null): number {
  if (!regionId) return 0;
  let h = 0;
  for (let i = 0; i < regionId.length; i += 1) {
    h = (h * 31 + regionId.charCodeAt(i)) | 0;
  }
  return ((h % 17) - 8) * 0.35;
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

const DEFAULT_DRIVER: SoundscapeDriverState = {
  ctxAllowed: false,
  masterLinear: 0,
  layers: {
    type: true,
    region: true,
    battle: true,
    evolution: true,
    environment: true,
  },
  scene: {
    regionOpen: false,
    regionId: null,
    battleOpen: false,
    compareOpen: false,
    discoveryRecoOpen: false,
    discoveryOpen: false,
    teamBuilderOpen: false,
    overlayOpen: false,
    overlayPanel: 'ball',
    primaryType: null,
    secondaryType: null,
  },
};

/**
 * Centralized procedural ambience (Web Audio).
 * Designed for low CPU: a handful of oscillators + looped noise buffers, one rAF tick.
 */
export class SoundscapeEngine {
  private Ctor: (typeof AudioContext) | null;
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private rafId = 0;
  private driver: SoundscapeDriverState = DEFAULT_DRIVER;
  private lastFrameMs = 0;
  private breathPhase = 0;
  private slowLfo = 0;

  private typeOsc: OscillatorNode | null = null;
  private typeNoise: AudioBufferSourceNode | null = null;
  private typeFilter: BiquadFilterNode | null = null;
  private typeGain: GainNode | null = null;

  private regionOscA: OscillatorNode | null = null;
  private regionOscB: OscillatorNode | null = null;
  private regionGain: GainNode | null = null;

  private battleNoise: AudioBufferSourceNode | null = null;
  private battleFilter: BiquadFilterNode | null = null;
  private battleGain: GainNode | null = null;

  private evoOscA: OscillatorNode | null = null;
  private evoOscB: OscillatorNode | null = null;
  private evoGain: GainNode | null = null;

  private envNoise: AudioBufferSourceNode | null = null;
  private envFilter: BiquadFilterNode | null = null;
  private envGain: GainNode | null = null;

  private paused = false;

  constructor() {
    this.Ctor = pickAudioContextCtor();
  }

  isSupported(): boolean {
    return this.Ctor !== null;
  }

  getAudioContextState(): AudioContextState | 'unsupported' {
    if (!this.ctx) return this.Ctor ? 'suspended' : 'unsupported';
    return this.ctx.state;
  }

  setDriver(next: SoundscapeDriverState): void {
    this.driver = next;
  }

  /**
   * Stops modulation, zeros output, and suspends the context to avoid idle rAF work.
   * Call `resume` + `setPaused(false)` after `start` when audio should play again.
   */
  setPaused(pause: boolean): void {
    if (this.paused === pause) return;
    this.paused = pause;
    if (pause) {
      cancelAnimationFrame(this.rafId);
      this.rafId = 0;
      if (this.master) this.master.gain.value = 0;
      void this.suspend();
      return;
    }
    void this.resume().then((ok) => {
      if (!ok || this.paused || !this.ctx) return;
      this.lastFrameMs = performance.now();
      if (!this.rafId) {
        this.rafId = requestAnimationFrame(this.tick);
      }
    });
  }

  /** Build graph; does not call resume (needs user gesture in many browsers). */
  start(): boolean {
    if (this.ctx || !this.Ctor) return Boolean(this.ctx);
    this.ctx = new this.Ctor();
    const ctx = this.ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(ctx.destination);

    const noiseBuf = createNoiseBuffer(ctx);
    const brownBuf = createBrownishBuffer(ctx);

    this.typeOsc = ctx.createOscillator();
    this.typeOsc.type = 'sine';
    this.typeOsc.frequency.value = typeCarrierHz(null);

    this.typeNoise = ctx.createBufferSource();
    this.typeNoise.buffer = noiseBuf;
    this.typeNoise.loop = true;

    this.typeFilter = ctx.createBiquadFilter();
    this.typeFilter.type = 'bandpass';
    this.typeFilter.frequency.value = 420;
    this.typeFilter.Q.value = 0.45;

    const typeNoiseGain = ctx.createGain();
    typeNoiseGain.gain.value = 0.06;

    this.typeGain = ctx.createGain();
    this.typeGain.gain.value = 0;

    this.typeOsc.connect(this.typeGain);
    this.typeNoise.connect(typeNoiseGain);
    typeNoiseGain.connect(this.typeFilter);
    this.typeFilter.connect(this.typeGain);
    this.typeGain.connect(this.master);

    this.typeOsc.start();

    this.typeNoise.start();

    this.regionOscA = ctx.createOscillator();
    this.regionOscA.type = 'sine';
    this.regionOscA.frequency.value = 55;

    this.regionOscB = ctx.createOscillator();
    this.regionOscB.type = 'sine';
    this.regionOscB.frequency.value = 55.6;

    this.regionGain = ctx.createGain();
    this.regionGain.gain.value = 0;
    this.regionOscA.connect(this.regionGain);
    this.regionOscB.connect(this.regionGain);
    this.regionGain.connect(this.master);
    this.regionOscA.start();
    this.regionOscB.start();

    this.battleNoise = ctx.createBufferSource();
    this.battleNoise.buffer = noiseBuf;
    this.battleNoise.loop = true;
    this.battleFilter = ctx.createBiquadFilter();
    this.battleFilter.type = 'bandpass';
    this.battleFilter.frequency.value = 1400;
    this.battleFilter.Q.value = 0.7;
    this.battleGain = ctx.createGain();
    this.battleGain.gain.value = 0;
    this.battleNoise.connect(this.battleFilter);
    this.battleFilter.connect(this.battleGain);
    this.battleGain.connect(this.master);
    this.battleNoise.start();

    this.evoOscA = ctx.createOscillator();
    this.evoOscA.type = 'sine';
    this.evoOscA.frequency.value = 880;
    this.evoOscB = ctx.createOscillator();
    this.evoOscB.type = 'sine';
    this.evoOscB.frequency.value = 1320;
    this.evoGain = ctx.createGain();
    this.evoGain.gain.value = 0;
    this.evoOscA.connect(this.evoGain);
    this.evoOscB.connect(this.evoGain);
    this.evoGain.connect(this.master);
    this.evoOscA.start();
    this.evoOscB.start();

    this.envNoise = ctx.createBufferSource();
    this.envNoise.buffer = brownBuf;
    this.envNoise.loop = true;
    this.envFilter = ctx.createBiquadFilter();
    this.envFilter.type = 'lowpass';
    this.envFilter.frequency.value = 320;
    this.envFilter.Q.value = 0.35;
    this.envGain = ctx.createGain();
    this.envGain.gain.value = 0;
    this.envNoise.connect(this.envFilter);
    this.envFilter.connect(this.envGain);
    this.envGain.connect(this.master);
    this.envNoise.start();

    this.lastFrameMs = performance.now();
    return true;
  }

  async resume(): Promise<boolean> {
    if (!this.ctx) return false;
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch {
        return false;
      }
    }
    return this.ctx.state === 'running';
  }

  async suspend(): Promise<void> {
    if (!this.ctx || this.ctx.state !== 'running') return;
    try {
      await this.ctx.suspend();
    } catch {
      /* ignore */
    }
  }

  dispose(): void {
    this.paused = true;
    cancelAnimationFrame(this.rafId);
    this.rafId = 0;
    const ctx = this.ctx;
    this.ctx = null;
    this.master = null;
    this.typeOsc = null;
    this.typeNoise = null;
    this.typeFilter = null;
    this.typeGain = null;
    this.regionOscA = null;
    this.regionOscB = null;
    this.regionGain = null;
    this.battleNoise = null;
    this.battleFilter = null;
    this.battleGain = null;
    this.evoOscA = null;
    this.evoOscB = null;
    this.evoGain = null;
    this.envNoise = null;
    this.envFilter = null;
    this.envGain = null;
    if (ctx) {
      try {
        void ctx.close();
      } catch {
        /* ignore */
      }
    }
  }

  private tick = (): void => {
    if (this.paused || !this.ctx) return;
    const now = performance.now();
    const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameMs) / 1000));
    this.lastFrameMs = now;

    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;

    const d = this.driver;
    const t = now / 1000;
    this.slowLfo += dt * 0.09;
    this.breathPhase += dt * 0.11;

    const lfoA = Math.sin(this.slowLfo * 1.03);
    const lfoB = Math.cos(t * 0.37 + this.breathPhase);
    const breath = 0.92 + 0.08 * Math.sin(this.breathPhase * 0.6);

    const evo = evolutionPulseLinear01(now);

    const scene = d.scene;
    const wantType =
      d.layers.type &&
      (scene.overlayPanel === 'pokemon' || scene.overlayOpen || scene.discoveryOpen);
    const typePrimary = scene.primaryType;
    const typeSecondary = scene.secondaryType;
    const carrier =
      typePrimary != null
        ? typeCarrierHz(typePrimary)
        : typeSecondary != null
          ? typeCarrierHz(typeSecondary) * 0.5 + typeCarrierHz('normal') * 0.5
          : typeCarrierHz('normal');

    if (this.typeOsc) {
      const targetHz = carrier * (1 + 0.012 * lfoA);
      this.typeOsc.frequency.setTargetAtTime(targetHz, ctx.currentTime, 0.12);
    }
    if (this.typeFilter) {
      const fq = 280 + 220 * smoothstep(-1, 1, lfoB) + (typePrimary ? 40 : 0);
      this.typeFilter.frequency.setTargetAtTime(fq, ctx.currentTime, 0.2);
    }

    const regionActive = d.layers.region && scene.regionOpen && Boolean(scene.regionId);
    const detune = hashRegionDetune(scene.regionId);
    if (this.regionOscA) {
      this.regionOscA.detune.setTargetAtTime(detune * 8, ctx.currentTime, 0.25);
    }
    if (this.regionOscB) {
      this.regionOscB.detune.setTargetAtTime(-detune * 6, ctx.currentTime, 0.25);
    }

    const battleActive = d.layers.battle && scene.battleOpen;
    const compareActive = d.layers.battle && scene.compareOpen;

    if (this.battleFilter) {
      const center = battleActive ? 1650 + 350 * lfoA : compareActive ? 1100 + 200 * lfoB : 900;
      this.battleFilter.frequency.setTargetAtTime(center, ctx.currentTime, 0.15);
    }

    const discoveryDim = scene.discoveryOpen ? 0.82 : 1;
    const recoDim = scene.discoveryRecoOpen ? 0.9 : 1;
    const teamDim = scene.teamBuilderOpen ? 0.88 : 1;

    const typeTarget =
      d.ctxAllowed && wantType
        ? d.masterLinear *
          0.055 *
          breath *
          discoveryDim *
          recoDim *
          teamDim *
          (scene.overlayPanel === 'pokemon' ? 1 : 0.55)
        : d.ctxAllowed && scene.overlayOpen && scene.overlayPanel === 'ball'
          ? d.masterLinear * 0.028 * breath * recoDim
          : d.ctxAllowed
            ? d.masterLinear * 0.018 * breath * recoDim
            : 0;

    const regionTarget =
      d.ctxAllowed && regionActive
        ? d.masterLinear * 0.05 * breath * discoveryDim * recoDim * teamDim
        : 0;

    const battleTarget = d.ctxAllowed
      ? battleActive
        ? d.masterLinear * 0.07 * breath * recoDim
        : compareActive
          ? d.masterLinear * 0.045 * breath * recoDim
          : 0
      : 0;

    const evoTarget =
      d.ctxAllowed && d.layers.evolution
        ? d.masterLinear * 0.09 * evo * breath * discoveryDim * recoDim
        : 0;

    const envTarget =
      d.ctxAllowed && d.layers.environment
        ? d.masterLinear * 0.035 * breath * discoveryDim * recoDim * teamDim * (regionActive ? 0.75 : 1)
        : 0;

    const ct = ctx.currentTime;
    master.gain.setTargetAtTime(d.ctxAllowed ? 1 : 0, ct, 0.08);
    this.typeGain?.gain.setTargetAtTime(typeTarget, ct, 0.12);
    this.regionGain?.gain.setTargetAtTime(regionTarget, ct, 0.18);
    this.battleGain?.gain.setTargetAtTime(battleTarget, ct, 0.12);
    this.evoGain?.gain.setTargetAtTime(evoTarget, ct, 0.06);
    this.envGain?.gain.setTargetAtTime(envTarget, ct, 0.2);
    this.envFilter?.frequency.setTargetAtTime(260 + 90 * lfoA, ct, 0.35);
    if (this.ctx && !this.paused) {
      this.rafId = requestAnimationFrame(this.tick);
    }
  };
}
