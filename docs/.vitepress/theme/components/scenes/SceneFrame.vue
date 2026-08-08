<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  title?: string
  /** Without it the scene inherits the page appearance. */
  appearance?: 'light' | 'dark'
  /** Any CSS color; derived accent tokens are recomputed in scenes.css. */
  accent?: string
}>()

const style = computed(() =>
  props.accent ? { '--macvue-accent': props.accent } : undefined,
)
</script>

<template>
  <div
    class="mv-scene"
    :data-macvue-appearance="appearance"
    :style="style"
  >
    <div class="mv-scene-titlebar">
      <span
        class="mv-scene-lights"
        aria-hidden="true"
      >
        <i class="mv-scene-light mv-scene-light--close" />
        <i class="mv-scene-light mv-scene-light--minimize" />
        <i class="mv-scene-light mv-scene-light--zoom" />
      </span>
      <span
        v-if="title"
        class="mv-scene-title"
      >{{ title }}</span>
    </div>
    <div class="mv-scene-body">
      <slot />
    </div>
  </div>
</template>
