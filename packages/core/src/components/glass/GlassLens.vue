<script setup lang="ts">
import type { GlassLensPreset } from './glassMaps'
import { getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'
import { createGlassMapData } from './glassMaps'

const props = defineProps<{
  lensClass: string
  filterClass: string
  preset: GlassLensPreset
}>()

const emit = defineEmits<{
  availability: [available: boolean]
}>()

const filterId = ref('')
const instanceId = getCurrentInstance()?.uid
const lens = ref<HTMLElement | null>(null)
const displacementMap = ref('')
const specularMap = ref('')
const displacementScale = ref(0)
const mapWidth = ref(0)
const mapHeight = ref(0)

let observer: ResizeObserver | undefined
let modeObserver: MutationObserver | undefined
let transparencyQuery: MediaQueryList | undefined

function mapToDataUrl(data: Uint8ClampedArray, width: number, height: number) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context)
    return
  const image = context.createImageData(width, height)
  image.data.set(data)
  context.putImageData(image, 0, 0)
  return canvas.toDataURL()
}

function updateMaps() {
  const element = lens.value
  const width = element?.offsetWidth ?? 0
  const height = element?.offsetHeight ?? 0
  if (!element || !width || !height)
    return false

  const computedRadius = Number.parseFloat(
    getComputedStyle(element).borderTopLeftRadius,
  )
  const maps = createGlassMapData({
    width,
    height,
    cornerRadius: Number.isFinite(computedRadius) ? computedRadius : height / 2,
    devicePixelRatio: window.devicePixelRatio || 1,
    preset: props.preset,
  })
  const nextDisplacementMap = mapToDataUrl(
    maps.displacement,
    maps.pixelWidth,
    maps.pixelHeight,
  )
  const nextSpecularMap = mapToDataUrl(
    maps.specular,
    maps.pixelWidth,
    maps.pixelHeight,
  )
  if (!nextDisplacementMap || !nextSpecularMap)
    return false

  displacementMap.value = nextDisplacementMap
  specularMap.value = nextSpecularMap
  displacementScale.value = maps.displacementScale
  mapWidth.value = width
  mapHeight.value = height
  return true
}

function updateAvailability() {
  const boundary = lens.value?.closest('[data-macvue-glass]')
  const glassEnabled = boundary?.getAttribute('data-macvue-glass') === 'on'
  const chromium = /(?:Chrome|Chromium|Edg)\//.test(
    globalThis.navigator?.userAgent ?? '',
  )
  const urlFilterSupported
    = chromium
      && (globalThis.CSS?.supports('backdrop-filter', 'url("#macvue-glass-test")')
        || globalThis.CSS?.supports(
          '-webkit-backdrop-filter',
          'url("#macvue-glass-test")',
        ))
  const available = Boolean(
    glassEnabled
    && urlFilterSupported
    && !transparencyQuery?.matches
    && updateMaps(),
  )
  emit('availability', available)
}

onMounted(() => {
  filterId.value = `macvue-glass-${instanceId}`
  transparencyQuery = window.matchMedia?.(
    '(prefers-reduced-transparency: reduce)',
  )
  transparencyQuery?.addEventListener('change', updateAvailability)
  if (typeof MutationObserver !== 'undefined' && lens.value) {
    modeObserver = new MutationObserver(updateAvailability)
    let ancestor: HTMLElement | null = lens.value.parentElement
    while (ancestor) {
      modeObserver.observe(ancestor, {
        attributes: true,
        attributeFilter: ['data-macvue-glass'],
      })
      ancestor = ancestor.parentElement
    }
  }
  if (typeof ResizeObserver !== 'undefined' && lens.value) {
    observer = new ResizeObserver(updateAvailability)
    observer.observe(lens.value)
  }
  updateAvailability()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  modeObserver?.disconnect()
  transparencyQuery?.removeEventListener('change', updateAvailability)
})
</script>

<template>
  <span
    ref="lens"
    :class="props.lensClass"
    aria-hidden="true"
    :style="
      filterId ? { '--_macvue-glass-filter': `url(#${filterId})` } : undefined
    "
  />
  <svg
    :class="props.filterClass"
    width="0"
    height="0"
    aria-hidden="true"
  >
    <filter
      :id="filterId || undefined"
      color-interpolation-filters="sRGB"
    >
      <feGaussianBlur
        in="SourceGraphic"
        :stdDeviation="props.preset.blur"
        result="blurred"
      />
      <feImage
        :href="displacementMap"
        x="0"
        y="0"
        :width="mapWidth"
        :height="mapHeight"
        preserveAspectRatio="none"
        result="displacement-map"
      />
      <feDisplacementMap
        in="blurred"
        in2="displacement-map"
        :scale="displacementScale"
        xChannelSelector="R"
        yChannelSelector="G"
        result="displaced"
      />
      <feColorMatrix
        in="displaced"
        type="saturate"
        :values="String(props.preset.saturation)"
        result="saturated"
      />
      <feImage
        :href="specularMap"
        x="0"
        y="0"
        :width="mapWidth"
        :height="mapHeight"
        preserveAspectRatio="none"
        result="specular"
      />
      <feComposite
        in="saturated"
        in2="specular"
        operator="in"
        result="refracted-rim"
      />
      <feColorMatrix
        in="refracted-rim"
        type="matrix"
        :values="`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${props.preset.specularOpacity} 0`"
        result="faded-refracted-rim"
      />
      <feColorMatrix
        in="specular"
        type="matrix"
        :values="`1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 ${props.preset.specularOpacity} 0`"
        result="faded-specular"
      />
      <feBlend
        in="faded-refracted-rim"
        in2="displaced"
        mode="normal"
        result="refracted-glass"
      />
      <feBlend
        in="faded-specular"
        in2="refracted-glass"
        mode="normal"
      />
    </filter>
  </svg>
</template>
