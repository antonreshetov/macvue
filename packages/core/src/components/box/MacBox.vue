<script setup lang="ts">
import './box.css'

export interface MacBoxProps {
  /** Caption above the box; the #title slot takes precedence. */
  title?: string
}

defineProps<MacBoxProps>()
</script>

<template>
  <!-- NSBox: an unadorned quaternary-fill rounded group container. -->
  <div class="macvue-box">
    <span
      v-if="$slots.title || title"
      class="macvue-box-title"
    >
      <slot name="title">{{ title }}</slot>
    </span>
    <div class="macvue-box-body">
      <slot />
    </div>
  </div>
</template>
