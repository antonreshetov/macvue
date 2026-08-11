<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mv-footer">
    <p class="mv-footer-legal">
      Copyright © {{ year }} Anton Reshetov
    </p>
    <p class="mv-footer-legal">
      MIT Licensed · Not affiliated with Apple Inc.
    </p>
  </footer>
</template>
