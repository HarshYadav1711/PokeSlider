import type { EvolutionDetail } from '../types/pokeapi';

function humanizeSlug(name: string): string {
  return name.replaceAll('-', ' ');
}

function resourceName(res: { name: string } | null | undefined): string | null {
  return res?.name ? humanizeSlug(res.name) : null;
}

/** One evolution method → short readable lines (deduped across `summarizeEvolutionDetails`). */
export function linesForEvolutionDetail(d: EvolutionDetail): string[] {
  const out: string[] = [];
  const trigger = d.trigger?.name ?? null;

  if (d.min_level != null && d.min_level > 0) {
    out.push(`Reach level ${d.min_level}`);
  }

  if (d.min_happiness != null && d.min_happiness > 0) {
    out.push(`High friendship (${d.min_happiness}+)`);
  }

  if (d.min_affection != null && d.min_affection > 0) {
    out.push(`Affection ${d.min_affection}+`);
  }

  if (d.min_beauty != null && d.min_beauty > 0) {
    out.push(`Beauty ${d.min_beauty}+`);
  }

  if (d.time_of_day && d.time_of_day.length > 0) {
    out.push(`Time: ${humanizeSlug(d.time_of_day)}`);
  }

  if (d.needs_overworld_rain) {
    out.push('While raining in the overworld');
  }

  const held = resourceName(d.held_item ?? null);
  if (held) {
    out.push(`Holding ${held}`);
  }

  const useItem = resourceName(d.item ?? null);
  if (trigger === 'use-item' && useItem) {
    out.push(`Use ${useItem}`);
  } else if (useItem && trigger !== 'trade') {
    out.push(`Item: ${useItem}`);
  }

  const loc = resourceName(d.location ?? null);
  if (loc) {
    out.push(`At ${loc}`);
  }

  const move = resourceName(d.known_move ?? null);
  if (move) {
    out.push(`After learning ${move}`);
  }

  const moveType = resourceName(d.known_move_type ?? null);
  if (moveType) {
    out.push(`After learning a ${moveType}-type move`);
  }

  if (d.gender === 1) {
    out.push('Female only');
  } else if (d.gender === 2) {
    out.push('Male only');
  }

  const party = resourceName(d.party_species ?? null);
  if (party) {
    out.push(`With ${party} in the party`);
  }

  const partyType = resourceName(d.party_type ?? null);
  if (partyType) {
    out.push(`With a ${partyType}-type in the party`);
  }

  const tradeFor = resourceName(d.trade_species ?? null);
  if (tradeFor) {
    out.push(`Trade for ${tradeFor}`);
  }

  if (d.relative_physical_stats === 1) {
    out.push('Attack greater than Defense');
  } else if (d.relative_physical_stats === -1) {
    out.push('Attack lower than Defense');
  } else if (d.relative_physical_stats === 0) {
    out.push('Attack equals Defense');
  }

  if (d.turn_upside_down) {
    out.push('Trade while holding the system upside down');
  }

  if (trigger === 'trade' && !tradeFor) {
    out.push('Trade');
  } else if (trigger && trigger !== 'level-up' && trigger !== 'use-item' && trigger !== 'trade') {
    out.push(humanizeSlug(trigger));
  }

  return out;
}

/** Collapse duplicate lines from multiple `EvolutionDetail` rows (alternate methods). */
export function summarizeEvolutionDetails(details: readonly EvolutionDetail[]): string[] {
  if (!details.length) return [];
  const seen = new Set<string>();
  const ordered: string[] = [];
  for (const d of details) {
    for (const line of linesForEvolutionDetail(d)) {
      if (seen.has(line)) continue;
      seen.add(line);
      ordered.push(line);
    }
  }
  return ordered;
}
