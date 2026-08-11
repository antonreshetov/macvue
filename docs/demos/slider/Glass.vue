<script setup lang="ts">
import {
  MacButton,
  MacCheckbox,
  MacSegment,
  MacSegmentedControl,
  MacSlider,
} from '@macvue/core'
import { ref } from 'vue'

const appearance = ref('dark')
const enlarged = ref(false)
const forceActive = ref(true)
const volume = ref(42)
</script>

<template>
  <div
    class="mv-glass-demo slider-glass-demo"
    :class="{ 'slider-glass-demo--enlarged': enlarged }"
    :data-macvue-appearance="appearance"
    data-macvue-glass="on"
    :data-macvue-glass-force-active="forceActive ? '' : undefined"
  >
    <MacSlider
      v-model="volume"
      aria-label="Glass volume"
    />
    <div class="slider-glass-demo__controls">
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
      <MacCheckbox v-model="forceActive">
        Force active
      </MacCheckbox>
      <MacButton
        size="small"
        @click="enlarged = !enlarged"
      >
        {{ enlarged ? "Native size" : "Enlarge lens" }}
      </MacButton>
    </div>
  </div>
</template>

<style scoped>
.slider-glass-demo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 40px;
}

.slider-glass-demo :deep(.macvue-slider) {
  width: min(70%, 400px);
}

.slider-glass-demo__controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.slider-glass-demo--enlarged :deep(.macvue-slider-glass-lens) {
  width: 66px;
  height: 44px;
  border-radius: 22px;
}
</style>
