<script setup lang="ts">
import { Separator } from 'reka-ui'
import './separator.css'

export interface MacSeparatorProps {
  orientation?: 'horizontal' | 'vertical'
  /** Purely visual separators can be hidden from assistive technology. */
  decorative?: boolean
}

const props = withDefaults(defineProps<MacSeparatorProps>(), {
  orientation: 'horizontal',
  decorative: false,
})
</script>

<template>
  <Separator
    class="macvue-separator"
    :orientation="props.orientation"
    :decorative="props.decorative"
  />
</template>
