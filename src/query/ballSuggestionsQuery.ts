import type { QueryClient } from '@tanstack/react-query';

import type { PokeBallDefinition } from '../data/pokeballs';
import { isPokemonTypeToken } from '../data/pokeballs';
import { LEGENDARY_MYTHICAL_POOL } from '../data/legendaryMythicalPool';
import { PSEUDO_LEGENDARY_IDS } from '../data/pseudoLegendaryIds';
import { partitionCatalog, pickPokemonForBall } from '../services/ballSuggestions';
import { fetchPokemonNationalIndex } from '../services/pokeapi/pokemonListResource';
import { fetchPokemonSummaryById } from '../services/pokeapi/pokemonSummary';
import { fetchPokemonIdsForType } from '../services/pokeapi/typePokemonIds';
import type { PokemonSummary } from '../types/pokemon';
import { seededShuffle, shuffle, takeUnique } from '../utils/array';

import { qk } from './keys';
import {
  STALE_NATIONAL_LIST_MS,
  STALE_POKEMON_SUMMARY_MS,
  STALE_TYPE_MEMBERS_MS,
} from './staleTimes';

async function ensureNationalDexIds(qc: QueryClient, signal: AbortSignal): Promise<number[]> {
  const rows = await qc.fetchQuery({
    queryKey: qk.pokemon.nationalIndex(),
    queryFn: ({ signal: s }) => fetchPokemonNationalIndex(AbortSignal.any([signal, s])),
    staleTime: STALE_NATIONAL_LIST_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });
  return rows.map((r) => r.id);
}

async function ensureSummary(qc: QueryClient, id: number, signal: AbortSignal): Promise<PokemonSummary | null> {
  return qc.fetchQuery({
    queryKey: qk.pokemon.summary(id),
    queryFn: ({ signal: s }) => fetchPokemonSummaryById(id, AbortSignal.any([signal, s])),
    staleTime: STALE_POKEMON_SUMMARY_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

async function ensureSummaries(
  qc: QueryClient,
  ids: readonly number[],
  signal: AbortSignal,
  batchSize = 12,
): Promise<PokemonSummary[]> {
  const unique = [...new Set(ids)].filter((n) => n > 0);
  const out: PokemonSummary[] = [];
  for (let i = 0; i < unique.length; i += batchSize) {
    if (signal.aborted) break;
    const chunk = unique.slice(i, i + batchSize);
    const rows = await Promise.all(chunk.map((id) => ensureSummary(qc, id, signal)));
    for (const row of rows) {
      if (row) out.push(row);
    }
  }
  return out;
}

async function ensureTypeMemberIds(
  qc: QueryClient,
  typeName: string,
  signal: AbortSignal,
): Promise<number[]> {
  return qc.fetchQuery({
    queryKey: qk.pokemon.typeMembers(typeName),
    queryFn: ({ signal: s }) => fetchPokemonIdsForType(typeName, AbortSignal.any([signal, s])),
    staleTime: STALE_TYPE_MEMBERS_MS,
    gcTime: 1000 * 60 * 60 * 24,
  });
}

async function expandPick(
  ball: PokeBallDefinition,
  qc: QueryClient,
  signal: AbortSignal,
  summaries: PokemonSummary[],
  pool: readonly number[],
  target: number,
): Promise<PokemonSummary[]> {
  let merged = [...summaries];
  const seen = new Set(merged.map((s) => s.id));
  let picked = pickPokemonForBall(ball, partitionCatalog(merged));
  let offset = 0;

  while (picked.length < target && offset < pool.length) {
    const chunk: number[] = [];
    while (chunk.length < 40 && offset < pool.length) {
      const id = pool[offset]!;
      offset += 1;
      if (!seen.has(id)) {
        seen.add(id);
        chunk.push(id);
      }
    }
    if (chunk.length === 0) break;
    const more = await ensureSummaries(qc, chunk, signal);
    merged = merged.concat(more);
    picked = pickPokemonForBall(ball, partitionCatalog(merged));
  }
  return picked;
}

export async function buildBallSuggestions(
  ball: PokeBallDefinition,
  qc: QueryClient,
  signal: AbortSignal,
): Promise<PokemonSummary[]> {
  if (ball.name === 'Master Ball') {
    const mythIds = seededShuffle([...LEGENDARY_MYTHICAL_POOL], ball.id);
    const dexIds = seededShuffle(await ensureNationalDexIds(qc, signal), `${ball.id}-dex`);
    const collected: PokemonSummary[] = [];
    const seen = new Set<number>();

    const ingest = async (ids: readonly number[]) => {
      const rows = await ensureSummaries(qc, ids, signal);
      for (const s of rows) {
        if ((s.isLegendary || s.isMythical) && !seen.has(s.id)) {
          seen.add(s.id);
          collected.push(s);
        }
      }
    };

    await ingest(mythIds.slice(0, 56));
    let offset = 0;
    while (collected.length < 30 && offset < dexIds.length) {
      await ingest(dexIds.slice(offset, offset + 50));
      offset += 50;
    }
    return takeUnique(shuffle(collected), 30);
  }

  const idPool = seededShuffle(await ensureNationalDexIds(qc, signal), `${ball.id}-dex`);

  if (ball.name === 'Ultra Ball') {
    const head = [...PSEUDO_LEGENDARY_IDS, ...takeUnique(idPool, 120)];
    const summaries = await ensureSummaries(qc, head, signal);
    return expandPick(ball, qc, signal, summaries, idPool, 25);
  }

  if (ball.name === 'Great Ball') {
    const head = [...PSEUDO_LEGENDARY_IDS, ...takeUnique(idPool, 100)];
    const summaries = await ensureSummaries(qc, head, signal);
    return expandPick(ball, qc, signal, summaries, idPool, 20);
  }

  const typeFilters = ball.pokemonTypes.filter(isPokemonTypeToken);

  if (ball.name === 'Net Ball' || ball.name === 'Dive Ball') {
    const buckets = await Promise.all(typeFilters.map((t) => ensureTypeMemberIds(qc, t, signal)));
    const mergedIds = [...new Set(buckets.flat())];
    const pickIds =
      mergedIds.length === 0
        ? []
        : takeUnique(seededShuffle(mergedIds, ball.id), Math.min(80, mergedIds.length));
    const summaries = await ensureSummaries(qc, pickIds, signal);
    if (summaries.length === 0) {
      const fallback = await ensureSummaries(qc, takeUnique(idPool, 60), signal);
      return pickPokemonForBall(ball, partitionCatalog(fallback));
    }
    return pickPokemonForBall(ball, partitionCatalog(summaries));
  }

  if (typeFilters.length > 0) {
    const buckets = await Promise.all(typeFilters.map((t) => ensureTypeMemberIds(qc, t, signal)));
    const fromTypes = [...new Set(buckets.flat())];
    const filler = takeUnique(
      idPool.filter((id) => !fromTypes.includes(id)),
      40,
    );
    const pickIds = [...takeUnique(seededShuffle(fromTypes, ball.id), 50), ...filler];
    const summaries = await ensureSummaries(qc, pickIds, signal);
    return pickPokemonForBall(ball, partitionCatalog(summaries));
  }

  const summaries = await ensureSummaries(qc, takeUnique(idPool, 80), signal);
  return pickPokemonForBall(ball, partitionCatalog(summaries));
}
