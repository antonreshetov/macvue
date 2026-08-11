<script setup lang="ts">
import { MacRadio, MacRadioGroup } from '@macvue/core'
import { ref } from 'vue'

const sortBy = ref('name')
</script>

<template>
  <MacRadioGroup
    v-model="sortBy"
    aria-label="Sort by"
  >
    <MacRadio value="name">
      Name
    </MacRadio>
    <MacRadio value="kind">
      Kind
    </MacRadio>
    <MacRadio value="date">
      Date modified
    </MacRadio>
  </MacRadioGroup>
</template>
