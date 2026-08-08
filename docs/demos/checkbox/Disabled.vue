<script setup lang="ts">
import { MacCheckbox } from 'macvue'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <MacCheckbox disabled>
      Disabled unchecked
    </MacCheckbox>
    <MacCheckbox
      :default-value="true"
      disabled
    >
      Disabled checked
    </MacCheckbox>
  </div>
</template>
