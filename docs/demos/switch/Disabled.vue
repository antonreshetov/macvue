<script setup lang="ts">
import { MacSwitch } from '@macvue/core'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <MacSwitch disabled>
      Disabled off
    </MacSwitch>
    <MacSwitch
      :default-value="true"
      disabled
    >
      Disabled on
    </MacSwitch>
  </div>
</template>
