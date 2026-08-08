<script setup lang="ts">
import type { MacControlSize } from '../../types'
import { computed, ref } from 'vue'
import './button.css'

export interface MacButtonProps {
  size?: MacControlSize
  variant?: 'default' | 'prominent' | 'destructive'
  disabled?: boolean
}

const props = withDefaults(defineProps<MacButtonProps>(), {
  size: 'regular',
  variant: 'default',
  disabled: false,
})

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
const el = ref<HTMLButtonElement | null>(null)

const classes = computed(() => [
  'macvue-button',
  `macvue-button--${props.size}`,
  `macvue-button--${props.variant}`,
])

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <button
    ref="el"
    type="button"
    :class="classes"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>
