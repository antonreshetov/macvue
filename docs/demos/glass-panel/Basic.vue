<script setup lang="ts">
import {
  MacCheckbox,
  MacGlassPanel,
  MacSegment,
  MacSegmentedControl,
} from 'macvue'
import { reactive, ref } from 'vue'

type Material = 'regular' | 'clear'

const offsets = reactive<Record<Material, { x: number, y: number }>>({
  regular: { x: 0, y: 0 },
  clear: { x: 0, y: 0 },
})
const appearance = ref('dark')
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
    :class="{ 'mv-glass-demo--detailed': useDetailedBackground }"
    :data-macvue-appearance="appearance"
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
    <div class="glass-materials__controls">
      <MacSegmentedControl
        v-model="appearance"
        size="small"
        aria-label="Scene appearance"
      >
        <MacSegment value="light">
          Light
        </MacSegment>
        <MacSegment value="dark">
          Dark
        </MacSegment>
      </MacSegmentedControl>
      <MacCheckbox v-model="useDetailedBackground">
        Detailed backdrop
      </MacCheckbox>
    </div>
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
  --mv-grid-offset: calc(
      (100% - min(455px, calc(100% - 48px))) / 2 - 12px
    ) -4px;
}

/* The inspectors belong under the glass — seeing them blurred through a
   panel is the point. Their own stacking context keeps the segmented
   control's internal z-index from escaping above the panels. */
.glass-materials__controls {
  position: relative;
  z-index: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.glass-materials__panel {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  height: 100px;
  padding: 20px 24px;
  color: var(--macvue-label);
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
  color: var(--macvue-label-secondary);
  font-size: 12px;
}
</style>
