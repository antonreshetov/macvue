<script setup lang="ts">
import { computed } from 'vue'
import './label.css'

export type MacLabelVariant
  = | 'large-title'
    | 'title-1'
    | 'title-2'
    | 'title-3'
    | 'headline'
    | 'body'
    | 'callout'
    | 'subheadline'
    | 'footnote'
    | 'caption-1'
    | 'caption-2'

export interface MacLabelProps {
  /** macOS text style; the eleven-step scale from the kit. */
  variant?: MacLabelVariant
  /** NSColor.secondaryLabelColor instead of labelColor. */
  secondary?: boolean
  /** Rendered tag. A plain string tag — typography needs no asChild. */
  as?: string
}

const props = withDefaults(defineProps<MacLabelProps>(), {
  variant: 'body',
  secondary: false,
  as: 'span',
})

const classes = computed(() => [
  'macvue-label',
  `macvue-label--${props.variant}`,
  { 'macvue-label--secondary': props.secondary },
])
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <slot />
  </component>
</template>
