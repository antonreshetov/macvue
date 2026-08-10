import { describe, expect, it } from 'vitest'
import { createGlassMapData } from '../src/components/glass/glassMaps'
import {
  sliderGlassPreset,
  switchGlassPreset,
} from '../src/components/glass/glassPresets'

function greenChannelAt(
  data: Uint8ClampedArray,
  width: number,
  x: number,
  y: number,
) {
  return data[(y * width + x) * 4 + 1]
}

describe('glass map engine', () => {
  it('creates DOM-independent maps at the requested density and radius', () => {
    const maps = createGlassMapData({
      width: 50,
      height: 31,
      cornerRadius: 15.5,
      devicePixelRatio: 2,
      preset: sliderGlassPreset,
    })

    expect(maps.pixelWidth).toBe(100)
    expect(maps.pixelHeight).toBe(62)
    expect(maps.displacement).toHaveLength(100 * 62 * 4)
    expect(maps.specular).toHaveLength(100 * 62 * 4)
    expect(maps.displacementScale).toBeCloseTo(
      83.88118841653394 * (31 / 60) * 0.9,
    )

    const center = (31 * maps.pixelWidth + 50) * 4
    expect(Array.from(maps.displacement.slice(center, center + 4))).toEqual([
      128,
      128,
      0,
      255,
    ])
  })

  it('keeps the slider convex and gives the switch a sign-changing lip', () => {
    const create = (
      preset: typeof sliderGlassPreset | typeof switchGlassPreset,
    ) =>
      createGlassMapData({
        width: 50,
        height: 31,
        cornerRadius: 15.5,
        devicePixelRatio: 2,
        preset,
      })
    const slider = create(sliderGlassPreset)
    const toggle = create(switchGlassPreset)
    const sliderEdge = Array.from({ length: 31 }, (_, y) =>
      greenChannelAt(slider.displacement, slider.pixelWidth, 50, y))
    const switchEdge = Array.from({ length: 31 }, (_, y) =>
      greenChannelAt(toggle.displacement, toggle.pixelWidth, 50, y))

    expect(sliderEdge.some(value => value < 128)).toBe(false)
    expect(sliderEdge.some(value => value > 128)).toBe(true)
    expect(switchEdge.some(value => value < 128)).toBe(true)
    expect(switchEdge.some(value => value > 128)).toBe(true)
  })

  it('adds one smoothing pass only when an opted-in bezel gets tiny', () => {
    const options = {
      width: 33,
      height: 20,
      cornerRadius: 10,
      devicePixelRatio: 1,
    }
    const adaptive = createGlassMapData({
      ...options,
      preset: switchGlassPreset,
    })
    const singlePass = createGlassMapData({
      ...options,
      preset: {
        ...switchGlassPreset,
        extraSmoothingBelowDevicePixels: 0,
      },
    })

    expect(adaptive.displacement).not.toEqual(singlePass.displacement)
    expect(sliderGlassPreset.materialVariant).toBe('control')
    expect(switchGlassPreset.materialVariant).toBe('control')
  })

  it('uses the supplied corner radius for future rounded panels', () => {
    const maps = createGlassMapData({
      width: 80,
      height: 40,
      cornerRadius: 10,
      devicePixelRatio: 1,
      preset: switchGlassPreset,
    })
    const topEdge = greenChannelAt(maps.displacement, maps.pixelWidth, 40, 0)
    const center = greenChannelAt(maps.displacement, maps.pixelWidth, 40, 20)

    expect(topEdge).not.toBe(128)
    expect(center).toBe(128)
  })
})
