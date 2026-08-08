<script setup lang="ts">
import './badge.css'
</script>

<template>
  <!-- The sidebar count capsule. One size only: AppKit badges carry no
       ControlSize. -->
  <span class="macvue-badge">
    <slot />
  </span>
</template>
