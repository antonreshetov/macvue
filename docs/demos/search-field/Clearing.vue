<script setup lang="ts">
import { MacSearchField } from '@macvue/core'
import { ref } from 'vue'

const query = ref('kittens')
</script>

<template>
  <MacSearchField
    v-model="query"
    aria-label="Search"
    style="width: 220px"
  />
</template>
