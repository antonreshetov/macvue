<script setup lang="ts">
import type { GlassLensPreset } from '../../../../packages/core/src/components/glass/glassMaps'
import { MacGlassPanel, MacSlider, MacSwitch } from '@macvue/core'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import GlassLens from '../../../../packages/core/src/components/glass/GlassLens.vue'

const props = withDefaults(
  defineProps<{
    variant?: 'aurora' | 'aurora-flow' | 'aurora-panel' | 'chromatic'
  }>(),
  {
    variant: 'aurora',
  },
)

const canvas = ref<HTMLCanvasElement | null>(null)
const optics = ref<HTMLElement | null>(null)
const glassAvailable = ref(false)
const autoBrightness = ref(true)
const trueTone = ref(true)
const nightShift = ref(false)
const brightness = ref(68)

const panelOffset = ref({ x: 0, y: 0 })
const panelDragging = ref(false)

const PANEL_DRAG_MARGIN = 12

let dragPanel: HTMLElement | null = null
let dragPointerId: number | null = null
let dragOrigin = {
  pointerX: 0,
  pointerY: 0,
  x: 0,
  y: 0,
  minX: 0,
  maxX: 0,
  minY: 0,
  maxY: 0,
}

function clampAxis(value: number, min: number, max: number, fallback: number) {
  // The panel can be wider than the stage on narrow viewports, leaving no room to travel.
  if (min > max)
    return fallback
  return Math.min(Math.max(value, min), max)
}

function isPanelDragHandle(target: EventTarget | null, pointerType: string) {
  if (!(target instanceof Element))
    return false
  // Custom controls are not form elements, and a click on the slider track lands
  // on its root, which carries no role — hence the component class as well.
  if (
    target.closest(
      'input, button, a, select, textarea, label, .macvue-slider, [role="slider"], [role="switch"], [role="spinbutton"]',
    )
  ) {
    return false
  }
  // Touch drags only from the header, so a finger on the panel body still scrolls the page.
  return (
    pointerType !== 'touch'
    || Boolean(target.closest('.mv-hero-control-panel-header'))
  )
}

function onPanelPointerDown(event: PointerEvent) {
  if (event.button !== 0 || !isPanelDragHandle(event.target, event.pointerType))
    return

  const panel = event.currentTarget as HTMLElement
  const stage = optics.value
  if (!stage)
    return

  const panelRect = panel.getBoundingClientRect()
  const stageRect = stage.getBoundingClientRect()
  const { x, y } = panelOffset.value
  const restLeft = panelRect.left - x
  const restTop = panelRect.top - y

  dragOrigin = {
    pointerX: event.clientX,
    pointerY: event.clientY,
    x,
    y,
    minX: stageRect.left + PANEL_DRAG_MARGIN - restLeft,
    maxX: stageRect.right - PANEL_DRAG_MARGIN - panelRect.width - restLeft,
    minY: stageRect.top + PANEL_DRAG_MARGIN - restTop,
    maxY: stageRect.bottom - PANEL_DRAG_MARGIN - panelRect.height - restTop,
  }

  dragPanel = panel
  dragPointerId = event.pointerId
  panelDragging.value = true
  panel.setPointerCapture(event.pointerId)
  event.preventDefault()
}

function onPanelPointerMove(event: PointerEvent) {
  if (!panelDragging.value || event.pointerId !== dragPointerId)
    return

  panelOffset.value = {
    x: clampAxis(
      dragOrigin.x + event.clientX - dragOrigin.pointerX,
      dragOrigin.minX,
      dragOrigin.maxX,
      panelOffset.value.x,
    ),
    y: clampAxis(
      dragOrigin.y + event.clientY - dragOrigin.pointerY,
      dragOrigin.minY,
      dragOrigin.maxY,
      panelOffset.value.y,
    ),
  }
}

function endPanelDrag(event: PointerEvent) {
  if (event.pointerId !== dragPointerId)
    return
  dragPanel?.releasePointerCapture(event.pointerId)
  dragPanel = null
  dragPointerId = null
  panelDragging.value = false
}

const chromaticFragmentShader = `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;

  void main() {
    vec2 screenUv = (gl_FragCoord.xy * 2.0 - resolution.xy)
      / min(resolution.x, resolution.y);
    vec2 uv = screenUv - vec2(0.28, 0.0);
    float t = time * 0.05;
    float lineWidth = 0.002;
    vec3 color = vec3(0.0);

    for (int channel = 0; channel < 3; channel++) {
      for (int line = 0; line < 5; line++) {
        float offset = float(line) * 0.01;
        float phase = fract(t - 0.01 * float(channel) + offset) * 5.0;
        float interference = abs(
          phase - length(uv) + mod(uv.x + uv.y, 0.2)
        );
        color[channel] += lineWidth * float(line * line)
          / max(interference, 0.0006);
      }
    }

    float vignette = 1.0 - smoothstep(0.62, 1.48, length(uv * vec2(0.78, 1.0)));
    float copyClear = mix(
      0.08,
      1.0,
      smoothstep(-0.72, 0.18, screenUv.x)
    );
    color *= vignette * copyClear;
    color = 1.0 - exp(-color * 1.12);

    gl_FragColor = vec4(color, 1.0);
  }
`

const auroraFragmentShader = `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise21(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + 1.0), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise21(point);
      point = rotation * point * 2.03 + 13.7;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 screenUv = (gl_FragCoord.xy * 2.0 - resolution.xy)
      / min(resolution.x, resolution.y);
    float t = time * 0.075;

    vec2 flow = vec2(
      fbm(screenUv * 0.92 + vec2(-t * 0.34, t * 0.16)),
      fbm(screenUv * 1.08 + vec2(t * 0.19, -t * 0.25) + 8.4)
    );
    vec2 warped = screenUv + (flow - 0.5) * 0.62;

    float ribbonAxis = warped.y + 0.30
      + 0.46 * sin(warped.x * 0.92 - t * 0.72)
      + 0.13 * sin(warped.x * 2.25 + t * 0.41);
    float wideRibbon = exp(-abs(ribbonAxis) * 1.18);
    float ribbonCore = exp(-abs(ribbonAxis + 0.015) * 4.1);
    float lowerEcho = exp(-abs(
      warped.y + 1.02 + 0.22 * sin(warped.x * 1.35 + t * 0.48)
    ) * 5.0);
    float cloud = fbm(warped * 1.75 + vec2(t * 0.22, -t * 0.11));
    float cloudDensity = smoothstep(0.20, 0.82, cloud);
    float luminousMass = wideRibbon * (0.18 + cloud * 1.08) * (0.62 + cloudDensity);

    vec2 lowerLight = warped - vec2(0.42, -0.72);
    vec2 upperLight = warped - vec2(0.98, 0.34);
    float softBloom = exp(-dot(lowerLight * vec2(0.70, 1.15), lowerLight) * 1.22)
      + exp(-dot(upperLight * vec2(0.82, 1.22), upperLight) * 1.48) * 0.54;

    vec3 color = vec3(0.004, 0.005, 0.014);
    color += vec3(0.025, 0.045, 0.20) * luminousMass * 1.52;
    color += vec3(0.22, 0.035, 0.64) * luminousMass * 1.34;
    color += vec3(0.60, 0.07, 1.00) * ribbonCore * (0.20 + cloud) * 0.72;
    color += vec3(0.24, 0.05, 0.72) * lowerEcho * (0.42 + cloud) * 0.90;
    color += vec3(0.56, 0.30, 1.00) * softBloom * luminousMass * 0.64;
    color += vec3(0.92, 0.84, 1.00) * pow(ribbonCore, 2.4)
      * (0.18 + cloudDensity * 0.34);

    float filamentWave = 0.5 + 0.5 * sin(
      (screenUv.x - t * 0.48 + flow.x * 0.055) * 61.0
    );
    float filaments = pow(filamentWave, 30.0)
      * (wideRibbon * 0.72 + lowerEcho * 0.46)
      * (0.36 + noise21(vec2(screenUv.x * 9.0, t * 2.0)));
    color += vec3(0.42, 0.48, 1.00) * filaments * 0.80;

    float rightFocus = mix(
      0.14,
      1.0,
      smoothstep(-0.62, 0.20, screenUv.x)
    );
    float vignette = 1.0 - smoothstep(
      0.72,
      1.72,
      length(screenUv * vec2(0.68, 1.0))
    );
    color *= rightFocus * vignette;

    float grain = hash21(gl_FragCoord.xy + floor(time * 18.0)) - 0.5;
    color += grain * 0.026;
    color = max(color, 0.0);
    color = 1.0 - exp(-color * 1.35);

    gl_FragColor = vec4(color, 1.0);
  }
`

const auroraFlowFragmentShader = `
  precision highp float;

  uniform vec2 resolution;
  uniform float time;

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32);
    return fract(point.x * point.y);
  }

  float noise21(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(hash21(cell + vec2(0.0, 1.0)), hash21(cell + 1.0), local.x),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.80, -0.60, 0.60, 0.80);
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * noise21(point);
      point = rotation * point * 2.03 + 13.7;
      amplitude *= 0.5;
    }
    return value;
  }

  void main() {
    vec2 screenUv = (gl_FragCoord.xy * 2.0 - resolution.xy)
      / min(resolution.x, resolution.y);
    float t = time * 0.075;

    vec2 flowNoise = vec2(
      fbm(screenUv * 0.90 + vec2(-t * 0.30, t * 0.14)),
      fbm(screenUv * 1.12 + vec2(t * 0.17, -t * 0.23) + 8.4)
    );
    vec2 warped = screenUv + (flowNoise - 0.5) * 0.42;

    float distanceDistortion = length(warped) * 0.014;
    float phase = t * 4.1;
    float waveScale = 1.32;
    float waveHeight = 0.34;
    float noiseBend = (
      noise21(vec2(warped.x * 0.72 + t * 0.18, t * 0.07)) - 0.5
    ) * 0.18;

    float redX = warped.x * (1.0 + distanceDistortion);
    float greenX = warped.x;
    float blueX = warped.x * (1.0 - distanceDistortion);

    float redAxis = warped.y + 0.16
      + sin((redX + phase) * waveScale) * waveHeight + noiseBend;
    float greenAxis = warped.y + 0.16
      + sin((greenX + phase) * waveScale) * waveHeight + noiseBend;
    float blueAxis = warped.y + 0.16
      + sin((blueX + phase) * waveScale) * waveHeight + noiseBend;

    vec3 spectralFlow = 0.019 / max(
      abs(vec3(redAxis, greenAxis, blueAxis)),
      vec3(0.014)
    );
    float flowEnvelope = exp(-abs(greenAxis) * 0.82);
    float cloud = fbm(warped * 1.62 + vec2(t * 0.23, -t * 0.12));
    spectralFlow *= flowEnvelope
      * (0.38 + cloud * 0.92);

    vec3 color = vec3(0.004, 0.005, 0.014);
    float auroraMass = exp(-abs(greenAxis) * 1.16) * (0.30 + cloud * 0.96);
    color += vec3(0.025, 0.042, 0.19) * auroraMass * 1.28;
    color += vec3(0.20, 0.035, 0.56) * auroraMass * 0.92;
    color += spectralFlow * vec3(0.86, 0.72, 1.0) * 1.08;

    float flareClock = t * 2.0;
    float flareSlot = floor(flareClock);
    float flarePhase = fract(flareClock);
    float flareX = mix(
      -1.28,
      1.30,
      pow(hash21(vec2(flareSlot + 4.7, 19.3)), 1.7)
    );
    float flareOffset = screenUv.x - flareX;
    float flareEvent = step(
      0.24,
      hash21(vec2(flareSlot + 31.8, 7.1))
    );
    float flarePulse = smoothstep(0.06, 0.14, flarePhase)
      * (1.0 - smoothstep(0.20, 0.38, flarePhase))
      * flareEvent;
    flarePulse = pow(flarePulse, 1.35);
    float flareStrength = mix(
      0.78,
      1.24,
      hash21(vec2(flareSlot + 12.4, 44.9))
    );
    float flareCore = exp(
      -length(vec2(flareOffset * 22.0, greenAxis * 60.0)) * 1.55
    );
    float flareHalo = exp(
      -length(vec2(flareOffset * 4.2, greenAxis * 13.0)) * 1.55
    );
    float flareSplit = smoothstep(-0.12, 0.12, flareOffset);
    vec3 flareColor = mix(
      vec3(0.20, 0.64, 1.42),
      vec3(1.12, 0.22, 1.38),
      flareSplit
    );
    vec3 lensFlare = vec3(1.48, 1.62, 1.92)
      * flareCore * 8.5 * flarePulse * flareStrength;
    lensFlare += flareColor * flareHalo
      * 2.8 * flarePulse * flareStrength;

    float filamentWave = 0.5 + 0.5 * sin(
      (screenUv.x - t * 0.48 + flowNoise.x * 0.055) * 61.0
    );
    float filaments = pow(filamentWave, 30.0)
      * auroraMass
      * (0.34 + noise21(vec2(screenUv.x * 9.0, t * 2.0)));
    float streamOcclusion = smoothstep(0.035, 0.18, abs(greenAxis));
    filaments *= streamOcclusion;
    color += vec3(0.38, 0.45, 1.0) * filaments * 0.72;

    float rightFocus = mix(
      0.12,
      1.0,
      smoothstep(-0.62, 0.18, screenUv.x)
    );
    float vignette = 1.0 - smoothstep(
      0.72,
      1.72,
      length(screenUv * vec2(0.68, 1.0))
    );
    color *= rightFocus * vignette;
    color += lensFlare * vignette;

    float grain = hash21(gl_FragCoord.xy + floor(time * 18.0)) - 0.5;
    color += grain * 0.024;
    color = max(color, 0.0);
    color = 1.0 - exp(-color * 1.28);

    gl_FragColor = vec4(color, 1.0);
  }
`

const heroKnobPreset = {
  refractiveIndex: 1.5,
  glassThickness: 92,
  maxBezelCssPixels: 26,
  displacementScaleAt60: 83.88118841653394,
  horizontalStrength: 1,
  verticalDirection: -1,
  extraSmoothingBelowDevicePixels: 6,
  maxDevicePixelRatio: 2,
  lightX: 0.5,
  lightY: 0.866,
  specularBounce: 0.3,
  materialVariant: 'control',
  surfaceProfile: 'lip',
  bezelRatio: 0.34,
  displacementStrength: 0.62,
  horizontalDirection: -1,
  smoothingPasses: 1,
  blur: 0.35,
  saturation: 3.4,
  specularOpacity: 0.24,
} satisfies GlassLensPreset

let teardown: (() => void) | undefined

onMounted(async () => {
  const element = canvas.value
  if (!element)
    return

  const THREE = await import('three')
  const renderer = new THREE.WebGLRenderer({
    canvas: element,
    alpha: false,
    antialias: false,
    powerPreference: 'low-power',
  })
  renderer.setClearColor(0x000000, 1)

  const scene = new THREE.Scene()
  const camera = new THREE.Camera()
  camera.position.z = 1

  const uniforms = {
    resolution: { value: new THREE.Vector2(1, 1) },
    time: { value: 0 },
  }

  const geometry = new THREE.PlaneGeometry(2, 2)
  const material = new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader:
      props.variant === 'chromatic'
        ? chromaticFragmentShader
        : props.variant === 'aurora-flow' || props.variant === 'aurora-panel'
          ? auroraFlowFragmentShader
          : auroraFragmentShader,
  })
  const mesh = new THREE.Mesh(geometry, material)
  scene.add(mesh)

  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches
  let staticTime: number | null = reducedMotion ? 8 : null
  const startedAt = performance.now()
  let frame = 0
  let visible = true
  let width = 0
  let height = 0

  const FRAME_INTERVAL_MS = 1000 / 30
  const FRAME_EPSILON_MS = 4
  let lastRenderAt = 0

  const WATCHDOG_SAMPLES = 60
  const WATCHDOG_SLOW_MS = 40
  const WATCHDOG_PAUSE_MS = 250
  const WATCHDOG_SLOW_LIMIT = 10
  const WATCHDOG_WARMUP_MS = 1000
  let watchdogWarmupUntil = 0
  let watchdogSeen = 0
  let watchdogSlow = 0
  let lastTickAt = 0

  function sampleWatchdog(now: number) {
    const isFirstTick = lastTickAt === 0
    const delta = now - lastTickAt
    lastTickAt = now
    if (isFirstTick) {
      if (watchdogWarmupUntil === 0)
        watchdogWarmupUntil = now + WATCHDOG_WARMUP_MS
      return
    }
    if (
      now < watchdogWarmupUntil
      || watchdogSeen >= WATCHDOG_SAMPLES
      || delta <= 0
      || delta > WATCHDOG_PAUSE_MS
    ) {
      return
    }
    watchdogSeen++
    watchdogSlow = delta > WATCHDOG_SLOW_MS ? watchdogSlow + 1 : 0
    if (watchdogSlow >= WATCHDOG_SLOW_LIMIT)
      staticTime = uniforms.time.value
  }

  function resize() {
    const nextWidth = Math.max(element.clientWidth, 1)
    const nextHeight = Math.max(element.clientHeight, 1)
    if (nextWidth === width && nextHeight === height)
      return

    width = nextWidth
    height = nextHeight
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.25))
    renderer.setSize(width, height, false)
    uniforms.resolution.value.set(element.width, element.height)
  }

  function render() {
    resize()
    uniforms.time.value = staticTime ?? (performance.now() - startedAt) / 1000
    renderer.render(scene, camera)
  }

  function animate(now = performance.now()) {
    if (!visible || document.hidden || staticTime !== null)
      return
    sampleWatchdog(now)
    const elapsed = now - lastRenderAt
    if (elapsed >= FRAME_INTERVAL_MS - FRAME_EPSILON_MS) {
      lastRenderAt
        = elapsed >= FRAME_INTERVAL_MS
          ? now - (elapsed % FRAME_INTERVAL_MS)
          : now
      render()
    }
    frame = requestAnimationFrame(animate)
  }

  function onVisibilityChange() {
    cancelAnimationFrame(frame)
    lastTickAt = 0
    if (visible && !document.hidden)
      animate()
  }

  const resizeObserver = new ResizeObserver(render)
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false
    cancelAnimationFrame(frame)
    lastTickAt = 0
    if (visible)
      animate()
  })

  resizeObserver.observe(element)
  intersectionObserver.observe(element)
  document.addEventListener('visibilitychange', onVisibilityChange)
  render()
  if (staticTime === null)
    animate()

  teardown = () => {
    cancelAnimationFrame(frame)
    resizeObserver.disconnect()
    intersectionObserver.disconnect()
    document.removeEventListener('visibilitychange', onVisibilityChange)
    geometry.dispose()
    material.dispose()
    renderer.dispose()
  }
})

onBeforeUnmount(() => teardown?.())
</script>

<template>
  <div
    ref="optics"
    class="mv-hero-optics-wrap"
    :data-hero-variant="props.variant"
  >
    <canvas
      ref="canvas"
      class="mv-hero-optics"
      aria-hidden="true"
    />
    <div
      v-if="props.variant === 'aurora-panel'"
      class="mv-hero-panel-stage"
      data-macvue-appearance="dark"
    >
      <MacGlassPanel
        material="clear"
        class="mv-hero-control-panel"
        :class="{ 'mv-hero-control-panel--dragging': panelDragging }"
        role="group"
        aria-label="Display settings"
        :style="{
          '--mv-hero-panel-x': `${panelOffset.x}px`,
          '--mv-hero-panel-y': `${panelOffset.y}px`,
        }"
        @pointerdown="onPanelPointerDown"
        @pointermove="onPanelPointerMove"
        @pointerup="endPanelDrag"
        @pointercancel="endPanelDrag"
      >
        <header class="mv-hero-control-panel-header">
          <strong>Display</strong>
        </header>

        <div class="mv-hero-control-group">
          <div class="mv-hero-control-row mv-hero-control-row--slider">
            <span>Brightness</span>
            <MacSlider
              v-model="brightness"
              aria-label="Brightness"
            />
          </div>
          <div class="mv-hero-control-row">
            <span>Automatically adjust brightness</span>
            <MacSwitch
              v-model="autoBrightness"
              aria-label="Automatically adjust brightness"
            />
          </div>
        </div>

        <div class="mv-hero-control-group">
          <div class="mv-hero-control-row">
            <span>True Tone</span>
            <MacSwitch
              v-model="trueTone"
              aria-label="True Tone"
            />
          </div>
          <div class="mv-hero-control-row">
            <span>Night Shift</span>
            <MacSwitch
              v-model="nightShift"
              aria-label="Night Shift"
            />
          </div>
        </div>
      </MacGlassPanel>
      <p class="mv-hero-panel-support">
        Drag the panel · enhanced refraction in Chromium, graceful fallback
        elsewhere
      </p>
    </div>
    <div
      v-else
      class="mv-hero-knob"
      :data-glass-ready="glassAvailable ? '' : undefined"
    >
      <GlassLens
        lens-class="mv-hero-glass-lens"
        filter-class="mv-hero-glass-filter"
        :preset="heroKnobPreset"
        @availability="glassAvailable = $event"
      />
    </div>
  </div>
</template>
