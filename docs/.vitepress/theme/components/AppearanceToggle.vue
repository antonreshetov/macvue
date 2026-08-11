<script setup lang="ts">
import { MacButton } from '@macvue/core'
import { useData } from 'vitepress'

const { isDark } = useData()

function toggle() {
  isDark.value = !isDark.value
}
</script>

<template>
  <!-- Label visibility is CSS-driven off [data-macvue-appearance] so SSR
       markup (isDark = false) never mismatches the restored appearance. -->
  <MacButton
    size="small"
    aria-label="Toggle appearance"
    @click="toggle"
  >
    <span class="mv-toggle-light">Light</span>
    <span class="mv-toggle-dark">Dark</span>
  </MacButton>
</template>
