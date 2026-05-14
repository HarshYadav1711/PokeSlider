import { useAppExperienceSurface } from '../experience/useAppExperienceSurface';

/**
 * When false, the home Poké Ball rack should unmount: no RAF, drag listeners, or 3D transforms.
 * Any immersive surface (overlay, dex sheet, modals, journey, soundscape panel, …) blocks the hero.
 */
export function useHomeHeroSurfaceActive(): boolean {
  return useAppExperienceSurface().isHomeCarouselSurface;
}
