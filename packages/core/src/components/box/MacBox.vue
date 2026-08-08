<script setup lang="ts">
import { useId } from 'reka-ui'
import { computed, useSlots } from 'vue'
import './box.css'

export interface MacBoxProps {
  /** Caption above the box; the #title slot takes precedence. */
  title?: string
}

const props = defineProps<MacBoxProps>()

const slots = useSlots()
const hasTitle = computed(() => Boolean(slots.title || props.title))
// SSR-safe id (Reka useId) linking the caption to the group.
const titleId = useId(undefined, 'macvue-box-title')
</script>

<template>
  <!-- NSBox: an unadorned quaternary-fill rounded group container. A
       titled box is a labelled group for assistive technology. -->
  <div
    class="macvue-box"
    :role="hasTitle ? 'group' : undefined"
    :aria-labelledby="hasTitle ? titleId : undefined"
  >
    <span
      v-if="hasTitle"
      :id="titleId"
      class="macvue-box-title"
    >
      <slot name="title">{{ title }}</slot>
    </span>
    <div class="macvue-box-body">
      <slot />
    </div>
  </div>
</template>
