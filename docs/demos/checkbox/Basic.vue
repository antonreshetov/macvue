<script setup lang="ts">
import { MacCheckbox } from 'macvue'
import { ref } from 'vue'

const checked = ref(true)
</script>

<template>
  <MacCheckbox v-model="checked">
    Show file extensions
  </MacCheckbox>
</template>
