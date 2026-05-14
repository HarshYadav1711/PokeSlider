import { useMediaQuery } from '../../hooks/useMediaQuery';

import type { AtlasRasterBreakpoint } from './data/regionAtlasRasterManifest';

export function useAtlasRasterBreakpoint(): AtlasRasterBreakpoint {
  const isMobile = useMediaQuery('(max-width: 639px)');
  const isTablet = useMediaQuery('(max-width: 1023px)');
  if (isMobile) return 'mobile';
  if (isTablet) return 'tablet';
  return 'desktop';
}
