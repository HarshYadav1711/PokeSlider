import type { RegionId } from './regionTypes';

export type AtlasRasterBreakpoint = 'mobile' | 'tablet' | 'desktop';

/**
 * Regions with shipped painterly atlas rasters under `public/region-atlas/`.
 * Empty by default so we never 404-fetch until assets are added.
 *
 * Expected filenames per region + breakpoint:
 *   `{regionId}-{breakpoint}.avif` and `{regionId}-{breakpoint}.webp`
 */
export const SHIPPED_REGION_ATLAS_RASTERS: ReadonlySet<RegionId> = new Set([]);

function withBase(path: string): string {
  const base = import.meta.env.BASE_URL;
  const normalized = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${normalized}${path.startsWith('/') ? path : `/${path}`}`;
}

export function atlasRasterBasename(regionId: RegionId, breakpoint: AtlasRasterBreakpoint): string {
  return `region-atlas/${regionId}-${breakpoint}`;
}

export function atlasRasterUrls(regionId: RegionId, breakpoint: AtlasRasterBreakpoint): {
  readonly avif: string;
  readonly webp: string;
} {
  const base = atlasRasterBasename(regionId, breakpoint);
  return {
    avif: withBase(`/${base}.avif`),
    webp: withBase(`/${base}.webp`),
  };
}

export function shouldLoadRegionAtlasRaster(regionId: RegionId): boolean {
  return SHIPPED_REGION_ATLAS_RASTERS.has(regionId);
}
