<script setup lang="ts">
import {
  MacCheckbox,
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
  MacSegment,
  MacSegmentedControl,
} from '@macvue/core'
import { ref } from 'vue'

const appearance = ref('dark')
const color = ref('red')
const useDetailedBackground = ref(false)
</script>

<template>
  <div
    class="mv-glass-demo pop-up-glass-demo"
    :class="{ 'mv-glass-demo--detailed': useDetailedBackground }"
    :data-macvue-appearance="appearance"
    data-macvue-glass="on"
  >
    <div class="pop-up-glass-demo__row">
      <span>pop up</span>
      <MacPopUpButton
        v-model="color"
        aria-label="Glass pop up"
        :teleport-to="false"
      >
        <MacPopUpButtonItem value="red">
          Red
        </MacPopUpButtonItem>
        <MacPopUpButtonItem value="green">
          Green
        </MacPopUpButtonItem>
        <MacPopUpButtonItem value="blue">
          Blue
        </MacPopUpButtonItem>
      </MacPopUpButton>
    </div>
    <div class="pop-up-glass-demo__row">
      <span>pull down</span>
      <MacPullDownButton
        aria-label="Glass pull down"
        label="Actions"
        :teleport-to="false"
      >
        <MacPullDownButtonItem>New</MacPullDownButtonItem>
        <MacPullDownButtonItem>Open…</MacPullDownButtonItem>
        <MacPullDownButtonItem>Save</MacPullDownButtonItem>
      </MacPullDownButton>
    </div>
    <div class="pop-up-glass-demo__controls">
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
.pop-up-glass-demo {
  position: relative;
  display: grid;
  grid-template-columns: max-content;
  align-items: center;
  align-content: center;
  justify-content: center;
  gap: 8px;
  overflow: hidden;
  --mv-grid-offset: calc(50% - 12px) calc(50% - 12px);
}

.pop-up-glass-demo__row {
  position: relative;
  display: grid;
  grid-template-columns: 72px 84px;
  align-items: center;
  gap: 8px;
}

.pop-up-glass-demo__controls {
  position: absolute;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  inset-block-end: 24px;
  inset-inline-start: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
}

.pop-up-glass-demo__row > span {
  color: var(--macvue-label-secondary);
  font: 500 12px/1 var(--macvue-font-family);
  text-align: right;
}
</style>
