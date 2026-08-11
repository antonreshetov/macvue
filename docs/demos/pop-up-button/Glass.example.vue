<script setup lang="ts">
import { MacPopUpButton, MacPopUpButtonItem } from 'macvue'
import { ref } from 'vue'

const color = ref('red')
</script>

<template>
  <div data-macvue-glass="on">
    <MacPopUpButton
      v-model="color"
      aria-label="Color"
      :teleport-to="false"
    >
      <MacPopUpButtonItem value="red">
        Red
      </MacPopUpButtonItem>
      <MacPopUpButtonItem value="green">
        Green
      </MacPopUpButtonItem>
    </MacPopUpButton>
  </div>
</template>
