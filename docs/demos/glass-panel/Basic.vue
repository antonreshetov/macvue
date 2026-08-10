<script setup lang="ts">
import { MacCheckbox, MacGlassPanel } from 'macvue'
import { reactive, ref } from 'vue'

type Material = 'regular' | 'clear'

const offsets = reactive<Record<Material, { x: number, y: number }>>({
  regular: { x: 0, y: 0 },
  clear: { x: 0, y: 0 },
})
const useDetailedBackground = ref(false)

let drag:
  | {
    material: Material
    pointerId: number
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  }
  | undefined

function panelStyle(material: Material) {
  const offset = offsets[material]
  return { transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }
}

function startDrag(event: PointerEvent, material: Material) {
  const panel = event.currentTarget as HTMLElement
  panel.setPointerCapture(event.pointerId)
  drag = {
    material,
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    offsetX: offsets[material].x,
    offsetY: offsets[material].y,
  }
}

function moveDrag(event: PointerEvent, material: Material) {
  if (!drag || drag.material !== material || drag.pointerId !== event.pointerId)
    return

  const panel = event.currentTarget as HTMLElement
  const stage = panel.parentElement
  if (!stage)
    return

  const panelRect = panel.getBoundingClientRect()
  const stageRect = stage.getBoundingClientRect()
  const baseLeft = panelRect.left - offsets[material].x
  const baseTop = panelRect.top - offsets[material].y
  const nextX = drag.offsetX + event.clientX - drag.startX
  const nextY = drag.offsetY + event.clientY - drag.startY

  offsets[material].x = Math.min(
    Math.max(nextX, stageRect.left - baseLeft),
    stageRect.right - baseLeft - panelRect.width,
  )
  offsets[material].y = Math.min(
    Math.max(nextY, stageRect.top - baseTop),
    stageRect.bottom - baseTop - panelRect.height,
  )
}

function stopDrag(event: PointerEvent) {
  const panel = event.currentTarget as HTMLElement
  if (panel.hasPointerCapture(event.pointerId))
    panel.releasePointerCapture(event.pointerId)
  drag = undefined
}
</script>

<template>
  <div
    class="mv-glass-demo glass-materials"
    :class="{ 'glass-materials--detailed': useDetailedBackground }"
    data-macvue-appearance="dark"
    data-macvue-glass="on"
  >
    <MacGlassPanel
      material="regular"
      class="glass-materials__panel"
      :style="panelStyle('regular')"
      @pointerdown="startDrag($event, 'regular')"
      @pointermove="moveDrag($event, 'regular')"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <strong>Regular</strong>
      <span>More blur and luminosity control.</span>
    </MacGlassPanel>
    <MacGlassPanel
      material="clear"
      class="glass-materials__panel"
      :style="panelStyle('clear')"
      @pointerdown="startDrag($event, 'clear')"
      @pointermove="moveDrag($event, 'clear')"
      @pointerup="stopDrag"
      @pointercancel="stopDrag"
    >
      <strong>Clear</strong>
      <span>More backdrop detail for media.</span>
    </MacGlassPanel>
    <MacCheckbox
      v-model="useDetailedBackground"
      class="glass-materials__background-toggle"
    >
      Detailed backdrop
    </MacCheckbox>
  </div>
</template>

<style scoped>
.glass-materials {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 455px);
  align-content: center;
  justify-content: center;
  gap: 24px;
  overflow: hidden;
  padding: 40px 24px;
  background-position: calc(
      (100% - min(455px, calc(100% - 48px))) / 2 - 12px
    ) -4px;
}

.glass-materials--detailed {
  background-color: #080713;
  background-image:
    repeating-linear-gradient(
      90deg,
      rgb(7 7 22 / 0.56) 0,
      rgb(7 7 22 / 0.16) 16px,
      rgb(166 99 255 / 0.3) 17px,
      rgb(15 11 37 / 0.72) 19px
    ),
    radial-gradient(
      ellipse 34% 72% at 12% 52%,
      rgb(255 244 255 / 0.98) 0%,
      rgb(214 119 255 / 0.92) 18%,
      rgb(123 57 255 / 0.62) 42%,
      transparent 72%
    ),
    radial-gradient(
      ellipse 44% 58% at 48% 106%,
      rgb(255 243 255 / 0.96) 0%,
      rgb(190 67 255 / 0.82) 20%,
      rgb(73 53 231 / 0.48) 48%,
      transparent 74%
    ),
    radial-gradient(
      ellipse 48% 52% at 72% 56%,
      rgb(87 60 229 / 0.7) 0%,
      rgb(42 31 129 / 0.42) 48%,
      transparent 78%
    ),
    linear-gradient(118deg, #12103a 0%, #100b29 46%, #03040b 100%);
  background-position: center;
  background-size: 100% 100%;
}

.glass-materials--detailed::before {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.3'/%3E%3C/svg%3E");
  content: "";
  opacity: 0.14;
  pointer-events: none;
}

.glass-materials__background-toggle {
  justify-self: center;
  color: white;
}

.glass-materials__panel {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  height: 100px;
  padding: 20px 24px;
  color: white;
  cursor: grab;
  text-align: center;
  touch-action: none;
  user-select: none;
  will-change: transform;
}

.glass-materials__panel:active {
  cursor: grabbing;
}

.glass-materials__panel strong {
  font-size: 18px;
}

.glass-materials__panel span {
  color: rgb(255 255 255 / 0.76);
  font-size: 12px;
}
</style>
