export interface NamedApiResource {
  name: string;
  url: string;
}

export interface PokemonListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: NamedApiResource[];
}

export interface PokemonSprites {
  front_default: string | null;
  other?: {
    'official-artwork'?: { front_default: string | null };
    home?: { front_default: string | null };
  };
}

export interface PokemonStat {
  base_stat: number;
  stat: NamedApiResource;
}

export interface PokemonTypeSlot {
  slot: number;
  type: NamedApiResource;
}

export interface PokemonCries {
  latest?: string | null;
  legacy?: string | null;
}

export interface PokemonAbilitySlot {
  is_hidden: boolean;
  slot: number;
  ability: NamedApiResource;
}

export interface PokemonResponse {
  id: number;
  name: string;
  url?: string;
  sprites: PokemonSprites;
  stats: PokemonStat[];
  types: PokemonTypeSlot[];
  species: NamedApiResource;
  cries?: PokemonCries | null;
  forms?: { name: string }[];
  height: number;
  weight: number;
  abilities?: PokemonAbilitySlot[];
}

export interface FlavorTextEntry {
  flavor_text: string;
  language: NamedApiResource;
}

export interface PokemonSpeciesResponse {
  flavor_text_entries: FlavorTextEntry[];
  evolution_chain: NamedApiResource;
  evolves_from_species: NamedApiResource | null;
  is_legendary: boolean;
  is_mythical: boolean;
  habitat: NamedApiResource | null;
  varieties: { is_default: boolean; pokemon: NamedApiResource }[];
}

export interface EvolutionDetail {
  min_level: number | null;
  item: NamedApiResource | null;
  trigger: NamedApiResource | null;
}

export interface ChainLink {
  species: NamedApiResource;
  evolution_details: EvolutionDetail[];
  evolves_to: ChainLink[];
}

export interface EvolutionChainResponse {
  chain: ChainLink;
}

export interface EncounterDetail {
  chance: number;
  min_level: number;
  max_level: number;
  method: NamedApiResource;
}

export interface VersionEncounterDetail {
  version: NamedApiResource;
  encounter_details: EncounterDetail[];
}

export interface LocationAreaEncounter {
  location_area: NamedApiResource;
  version_details: VersionEncounterDetail[];
}

export interface TypeDamageRelations {
  double_damage_from: NamedApiResource[];
  half_damage_from: NamedApiResource[];
  no_damage_from: NamedApiResource[];
}

export interface TypePokemonSlot {
  slot: number;
  pokemon: NamedApiResource;
}

export interface TypeResponse {
  damage_relations: TypeDamageRelations;
  /** Present on full `GET /type/{name}` resources — used for lazy ball suggestions. */
  pokemon?: TypePokemonSlot[];
}

export interface GenerationResponse {
  id: number;
  name: string;
  pokemon_species: NamedApiResource[];
}

export interface PokedexListEntry {
  name: string;
  url: string;
}

export interface PokedexPokemonEntry {
  entry_number: number;
  pokemon_species: NamedApiResource;
}

export interface PokedexDetailResponse {
  id: number;
  name: string;
  pokemon_entries: PokedexPokemonEntry[];
}

export interface AbilityPokemonSlot {
  is_hidden: boolean;
  slot: number;
  pokemon: NamedApiResource;
}

export interface AbilityDetailResponse {
  id: number;
  name: string;
  pokemon: AbilityPokemonSlot[];
}

export interface PokemonFormDetailResponse {
  id: number;
  name: string;
  pokemon: NamedApiResource;
}
