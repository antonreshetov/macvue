<script setup lang="ts">
import { MacBox, MacSwitch } from 'macvue'
import { ref } from 'vue'

const wifi = ref(true)
const bluetooth = ref(false)
</script>

<template>
  <MacBox
    title="Network"
    style="width: 260px"
  >
    <div style="display: flex; flex-direction: column; gap: 10px">
      <MacSwitch
        v-model="wifi"
        style="justify-content: space-between"
      >
        Wi-Fi
      </MacSwitch>
      <MacSwitch
        v-model="bluetooth"
        style="justify-content: space-between"
      >
        Bluetooth
      </MacSwitch>
    </div>
  </MacBox>
</template>
