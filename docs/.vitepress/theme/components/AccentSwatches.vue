<script setup lang="ts">
import { accentOptions, defaultAccent } from '../accents'

const accent = defineModel<string>({ default: defaultAccent })
</script>

<template>
  <div class="mv-swatches">
    <button
      v-for="item in accentOptions"
      :key="item.name"
      type="button"
      class="mv-swatch"
      :class="{ 'mv-swatch--active': accent === item.value }"
      :style="{ background: item.value }"
      :aria-label="`${item.name} accent`"
      :aria-pressed="accent === item.value"
      @click="accent = item.value"
    />
  </div>
</template>
