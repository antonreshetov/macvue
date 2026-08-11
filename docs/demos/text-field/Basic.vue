<script setup lang="ts">
import { MacTextField } from '@macvue/core'
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <MacTextField
    v-model="name"
    aria-label="Name"
    placeholder="Name"
    style="width: 220px"
  />
</template>
