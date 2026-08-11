import type { GlassLensPreset } from './glassMaps'

const baseGlassPreset = {
  refractiveIndex: 1.5,
  glassThickness: 75,
  maxBezelCssPixels: 18,
  displacementScaleAt60: 83.88118841653394,
  horizontalStrength: 1,
  verticalDirection: -1,
  extraSmoothingBelowDevicePixels: 6,
  maxDevicePixelRatio: 2,
  lightX: 0.5,
  lightY: 0.866,
  specularBounce: 0.3,
} as const

export const sliderGlassPreset = {
  ...baseGlassPreset,
  materialVariant: 'control',
  surfaceProfile: 'convex',
  displacementStrength: 0.9,
  horizontalDirection: 1,
  smoothingPasses: 0,
  blur: 0,
  saturation: 7,
  specularOpacity: 0.4,
} satisfies GlassLensPreset

export const switchGlassPreset = {
  ...baseGlassPreset,
  materialVariant: 'control',
  surfaceProfile: 'lip',
  bezelRatio: 0.42,
  displacementStrength: 0.39,
  horizontalDirection: -1,
  smoothingPasses: 1,
  blur: 0.4,
  saturation: 3,
  specularOpacity: 0.18,
} satisfies GlassLensPreset

export const regularPanelGlassPreset = {
  ...baseGlassPreset,
  materialVariant: 'regular',
  surfaceProfile: 'convex',
  bezelRatio: 0.12,
  displacementStrength: 0.24,
  horizontalDirection: 1,
  smoothingPasses: 1,
  blur: 12,
  saturation: 1,
  specularOpacity: 0.05,
} satisfies GlassLensPreset

export const clearPanelGlassPreset = {
  ...baseGlassPreset,
  refractiveIndex: 1.3,
  glassThickness: 90,
  materialVariant: 'clear',
  surfaceProfile: 'convex',
  bezelRatio: 1,
  displacementStrength: 0.7,
  horizontalDirection: -1,
  verticalDirection: -1,
  smoothingPasses: 0,
  blur: 2,
  saturation: 1,
  specularOpacity: 0.07,
} satisfies GlassLensPreset

// Compact menus use the same clear material pipeline as MacGlassPanel. The
// separate alias leaves room for size-specific calibration without changing
// the display panel.
export const popUpMenuGlassPreset = {
  ...clearPanelGlassPreset,
  displacementStrength: 0.24,
  smoothingPasses: 1,
  blur: 4,
  saturation: 1.2,
  specularOpacity: 0.09,
} satisfies GlassLensPreset
