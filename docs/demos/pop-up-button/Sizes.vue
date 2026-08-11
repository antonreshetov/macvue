<script setup lang="ts">
import type { MacControlSize } from '@macvue/core'
import {
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
} from '@macvue/core'

const sizes: MacControlSize[] = [
  'mini',
  'small',
  'regular',
  'large',
  'extra-large',
]

const sizeLabels: Record<MacControlSize, string> = {
  'mini': 'mini',
  'small': 'small',
  'regular': 'regular',
  'large': 'large',
  'extra-large': 'extraLarge',
}
</script>

<template>
  <div class="pop-up-size-grid">
    <template
      v-for="size in sizes"
      :key="size"
    >
      <span class="pop-up-size-label">{{ sizeLabels[size] }}</span>
      <MacPopUpButton
        default-value="red"
        :size="size"
        :aria-label="`${size} color`"
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
      <MacPullDownButton
        label="Actions"
        :size="size"
        :aria-label="`${size} actions`"
        :teleport-to="false"
      >
        <MacPullDownButtonItem>New</MacPullDownButtonItem>
        <MacPullDownButtonItem>Open…</MacPullDownButtonItem>
        <MacPullDownButtonItem>Save</MacPullDownButtonItem>
      </MacPullDownButton>
    </template>
  </div>
</template>

<style scoped>
.pop-up-size-grid {
  display: grid;
  grid-template-columns: max-content max-content max-content;
  align-items: center;
  justify-content: center;
  gap: 8px 12px;
}

.pop-up-size-label {
  color: var(--macvue-label-secondary);
  font-size: 12px;
  text-align: end;
}
</style>
