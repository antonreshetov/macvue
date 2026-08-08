<script setup lang="ts">
import type { MacControlSize } from '../../types'
import { computed, ref } from 'vue'
import './help-button.css'

export interface MacHelpButtonProps {
  size?: MacControlSize
  disabled?: boolean
  /** Accessible label (no locale layer yet). */
  label?: string
}

const props = withDefaults(defineProps<MacHelpButtonProps>(), {
  size: 'regular',
  disabled: false,
  label: 'Help',
})

const classes = computed(() => [
  'macvue-help-button',
  `macvue-help-button--${props.size}`,
])

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
const el = ref<HTMLButtonElement | null>(null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <!-- NSButton bezel .helpButton: a circular neutral button with a "?". -->
  <button
    ref="el"
    type="button"
    :class="classes"
    :disabled="disabled"
    :aria-label="label"
  >
    <span aria-hidden="true">?</span>
  </button>
</template>
