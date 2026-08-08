<script setup lang="ts">
import { withBase } from 'vitepress'

defineProps<{
  title: string
  href: string
}>()
</script>

<!-- The link is stretched over the card via ::after instead of wrapping the
     preview, so live controls are never nested inside an <a>. -->
<template>
  <div class="mv-card">
    <div class="mv-card-preview">
      <slot />
    </div>
    <p class="mv-card-title">
      <a
        class="mv-card-link"
        :href="withBase(href)"
      >{{ title }}</a>
    </p>
  </div>
</template>
