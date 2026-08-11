<script setup lang="ts">
import { MacSwitch } from 'macvue'
import { ref } from 'vue'

const enabled = ref(true)
</script>

<template>
  <div data-macvue-glass="on">
    <MacSwitch v-model="enabled">
      Wi-Fi
    </MacSwitch>
  </div>
</template>
