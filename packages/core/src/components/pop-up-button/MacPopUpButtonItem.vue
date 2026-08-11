<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import type { AcceptableValue } from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import { SelectItem, SelectItemIndicator, SelectItemText } from 'reka-ui'
import { computed, ref } from 'vue'
import './pop-up-button.css'

export interface MacPopUpButtonItemProps<T = AcceptableValue> {
  value: T
  disabled?: boolean
  textValue?: string
}

const props = withDefaults(defineProps<MacPopUpButtonItemProps<T>>(), {
  disabled: false,
})

const item = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLElement | null>(() => item.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <SelectItem
    ref="item"
    class="macvue-pop-up-button-item"
    :value="props.value"
    :disabled="disabled"
    :text-value="textValue"
  >
    <SelectItemIndicator class="macvue-pop-up-button-item-indicator">
      <svg
        class="macvue-pop-up-button-check"
        viewBox="0 0 10 8"
        fill="none"
        stroke="currentColor"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <path d="M1 4.2 3.7 7 9 1" />
      </svg>
    </SelectItemIndicator>
    <SelectItemText class="macvue-pop-up-button-item-text">
      <slot />
    </SelectItemText>
  </SelectItem>
</template>
