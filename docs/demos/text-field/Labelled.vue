<script setup lang="ts">
import { MacTextField } from 'macvue'
import { ref } from 'vue'

const server = ref('')
</script>

<template>
  <div style="display: flex; align-items: center; gap: 8px">
    <label
      for="demo-server"
      style="font-size: 13px"
    >Server:</label>
    <MacTextField
      id="demo-server"
      v-model="server"
      placeholder="smb://"
      style="width: 200px"
    />
  </div>
</template>
