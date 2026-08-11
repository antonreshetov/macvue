<script setup lang="ts">
import { MacPopUpButton, MacPopUpButtonItem } from '@macvue/core'
</script>

<template>
  <div style="display: flex; align-items: center; gap: 12px">
    <MacPopUpButton
      default-value="green"
      aria-label="Enabled color"
      :teleport-to="false"
    >
      <MacPopUpButtonItem value="red">
        Red
      </MacPopUpButtonItem>
      <MacPopUpButtonItem value="green">
        Green
      </MacPopUpButtonItem>
      <MacPopUpButtonItem
        value="blue"
        disabled
      >
        Blue
      </MacPopUpButtonItem>
    </MacPopUpButton>
    <MacPopUpButton
      default-value="red"
      aria-label="Disabled color"
      disabled
    >
      <MacPopUpButtonItem value="red">
        Red
      </MacPopUpButtonItem>
    </MacPopUpButton>
  </div>
</template>
