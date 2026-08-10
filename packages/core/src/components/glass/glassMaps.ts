export type GlassSurfaceProfile = 'convex' | 'lip'
export type GlassMaterialVariant = 'control' | 'regular' | 'clear'

export interface GlassLensPreset {
  materialVariant: GlassMaterialVariant
  surfaceProfile: GlassSurfaceProfile
  refractiveIndex: number
  glassThickness: number
  bezelRatio?: number
  maxBezelCssPixels: number
  displacementScaleAt60: number
  displacementStrength: number
  horizontalDirection: -1 | 1
  horizontalStrength: number
  verticalDirection: -1 | 1
  smoothingPasses: number
  extraSmoothingBelowDevicePixels: number
  maxDevicePixelRatio: number
  lightX: number
  lightY: number
  specularBounce: number
  blur: number
  saturation: number
  specularOpacity: number
}

export interface GlassMapData {
  pixelWidth: number
  pixelHeight: number
  displacement: Uint8ClampedArray
  specular: Uint8ClampedArray
  displacementScale: number
}

interface CreateGlassMapDataOptions {
  width: number
  height: number
  cornerRadius: number
  devicePixelRatio: number
  preset: GlassLensPreset
}

const SLICE_SAMPLES = 128
const DERIVATIVE_DELTA = 0.0001

function convexSquircle(x: number) {
  return (1 - (1 - x) ** 4) ** 0.25
}

function smootherstep(x: number) {
  return x ** 3 * (x * (x * 6 - 15) + 10)
}

function surfaceHeight(profile: GlassSurfaceProfile, x: number) {
  const convex = convexSquircle(x)
  if (profile === 'convex')
    return convex
  const concave = 1 - convex
  const mix = smootherstep(x)
  return convex * (1 - mix) + concave * mix
}

function computeSlice(bezel: number, preset: GlassLensPreset) {
  const offsets = new Float64Array(SLICE_SAMPLES)
  const eta = 1 / preset.refractiveIndex
  let max = 0

  for (let index = 0; index < SLICE_SAMPLES; index++) {
    const x = index / SLICE_SAMPLES
    const y = surfaceHeight(preset.surfaceProfile, x)
    const slope
      = (surfaceHeight(preset.surfaceProfile, x + DERIVATIVE_DELTA) - y)
        / DERIVATIVE_DELTA
    const normalLength = Math.hypot(slope, 1)
    const normalX = -slope / normalLength
    const normalY = -1 / normalLength
    const k = 1 - eta * eta * (1 - normalY * normalY)
    if (k < 0)
      continue

    const c = eta * normalY + Math.sqrt(k)
    const transmittedX = -c * normalX
    const transmittedY = eta - c * normalY
    offsets[index]
      = transmittedX * ((y * bezel + preset.glassThickness) / transmittedY)
    max = Math.max(max, Math.abs(offsets[index]))
  }

  return { offsets, max }
}

function smoothDisplacementMap(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  passes: number,
) {
  if (passes <= 0)
    return

  let source = new Uint8ClampedArray(data)

  for (let pass = 0; pass < passes; pass++) {
    const target = new Uint8ClampedArray(source)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const offset = (y * width + x) * 4

        for (let channel = 0; channel < 2; channel++) {
          let total = 0
          for (let sampleY = -1; sampleY <= 1; sampleY++) {
            for (let sampleX = -1; sampleX <= 1; sampleX++) {
              total
                += source[((y + sampleY) * width + x + sampleX) * 4 + channel]
            }
          }
          target[offset + channel] = Math.round(total / 9)
        }
      }
    }

    source = target
  }

  data.set(source)
}

export function createGlassMapData({
  width,
  height,
  cornerRadius,
  devicePixelRatio,
  preset,
}: CreateGlassMapDataOptions): GlassMapData {
  const ratio = Math.max(
    Math.min(devicePixelRatio || 1, preset.maxDevicePixelRatio),
    0.1,
  )
  const pixelWidth = Math.max(Math.round(width * ratio), 1)
  const pixelHeight = Math.max(Math.round(height * ratio), 1)
  const displacement = new Uint8ClampedArray(pixelWidth * pixelHeight * 4)
  const specular = new Uint8ClampedArray(pixelWidth * pixelHeight * 4)
  const radius = Math.min(
    Math.max(cornerRadius * ratio, 1),
    pixelWidth / 2,
    pixelHeight / 2,
  )
  const bezel = Math.max(
    preset.bezelRatio !== undefined
      ? radius * preset.bezelRatio
      : Math.min(preset.maxBezelCssPixels * ratio, radius),
    0.0001,
  )
  const slice = computeSlice(bezel / ratio, preset)
  const radiusSquared = radius ** 2
  const outerRadiusSquared = (radius + ratio) ** 2
  const innerRadiusSquared = Math.max(radius - bezel, 0) ** 2
  const straightWidth = pixelWidth - radius * 2
  const straightHeight = pixelHeight - radius * 2

  for (let y = 0; y < pixelHeight; y++) {
    for (let x = 0; x < pixelWidth; x++) {
      const offset = (y * pixelWidth + x) * 4
      const deltaX
        = x < radius
          ? x - radius
          : x >= pixelWidth - radius
            ? x - radius - straightWidth
            : 0
      const deltaY
        = y < radius
          ? y - radius
          : y >= pixelHeight - radius
            ? y - radius - straightHeight
            : 0
      const radiusAtPixelSquared = deltaX ** 2 + deltaY ** 2

      displacement[offset] = 128
      displacement[offset + 1] = 128
      displacement[offset + 2] = 0
      displacement[offset + 3] = 255

      if (
        radiusAtPixelSquared > outerRadiusSquared
        || radiusAtPixelSquared < innerRadiusSquared
      ) {
        continue
      }

      const radiusAtPixel = Math.sqrt(radiusAtPixelSquared)
      const opacity
        = radiusAtPixelSquared < radiusSquared
          ? 1
          : 1 - (radiusAtPixel - radius) / ratio
      const edge = radius - radiusAtPixel
      const sliceIndex = Math.max(
        0,
        Math.min(Math.floor((edge / bezel) * SLICE_SAMPLES), SLICE_SAMPLES - 1),
      )
      const refraction = slice.offsets[sliceIndex] / (slice.max || 1)
      const normalX = deltaX / (radiusAtPixel || 1)
      const normalY = deltaY / (radiusAtPixel || 1)

      displacement[offset] = Math.round(
        128
        + normalX
        * refraction
        * 127
        * opacity
        * preset.horizontalDirection
        * preset.horizontalStrength,
      )
      displacement[offset + 1] = Math.round(
        128 + normalY * refraction * 127 * opacity * preset.verticalDirection,
      )

      const bezelLight = Math.sqrt(Math.max(1 - (1 - edge / ratio) ** 2, 0))
      const light = normalX * preset.lightX - normalY * preset.lightY
      const directed = light >= 0 ? light : -light * preset.specularBounce
      const coefficient = bezelLight * directed
      specular[offset] = Math.round(255 * coefficient)
      specular[offset + 1] = Math.round(255 * coefficient)
      specular[offset + 2] = Math.round(255 * coefficient)
      specular[offset + 3] = Math.round(255 * coefficient * opacity)
    }
  }

  const smoothingPasses
    = preset.smoothingPasses > 0 && bezel < preset.extraSmoothingBelowDevicePixels
      ? preset.smoothingPasses + 1
      : preset.smoothingPasses
  smoothDisplacementMap(
    displacement,
    pixelWidth,
    pixelHeight,
    Math.max(0, Math.floor(smoothingPasses)),
  )

  return {
    pixelWidth,
    pixelHeight,
    displacement,
    specular,
    displacementScale:
      preset.displacementScaleAt60
      * (height / 60)
      * preset.displacementStrength,
  }
}
