<script setup lang="ts">
import { computed, ref } from 'vue'
import GlassLens from '../glass/GlassLens.vue'
import {
  clearPanelGlassPreset,
  regularPanelGlassPreset,
} from '../glass/glassPresets'
import './glass-panel.css'

export type MacGlassPanelMaterial = 'regular' | 'clear'

export interface MacGlassPanelProps {
  /** Liquid Glass material. Clear is intended for media-rich backdrops. */
  material?: MacGlassPanelMaterial
}

const props = withDefaults(defineProps<MacGlassPanelProps>(), {
  material: 'regular',
})

const glassAvailable = ref(false)
const preset = computed(() =>
  props.material === 'clear' ? clearPanelGlassPreset : regularPanelGlassPreset,
)
</script>

<template>
  <div
    class="macvue-glass-panel"
    :class="`macvue-glass-panel--${material}`"
    :data-macvue-glass-ready="glassAvailable ? '' : undefined"
  >
    <GlassLens
      lens-class="macvue-glass-panel-lens"
      filter-class="macvue-glass-panel-filter"
      :preset="preset"
      @availability="glassAvailable = $event"
    />
    <slot />
  </div>
</template>
