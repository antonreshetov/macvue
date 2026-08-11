<script setup lang="ts">
import { MacSecureField } from '@macvue/core'
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <MacSecureField
    v-model="password"
    aria-label="Password"
    placeholder="Password"
    autocomplete="current-password"
    style="width: 220px"
  />
</template>
