<script setup lang="ts">
import { MacCheckbox } from 'macvue'
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 8px">
    <MacCheckbox :default-value="false">
      Unchecked
    </MacCheckbox>
    <MacCheckbox :default-value="true">
      Checked
    </MacCheckbox>
    <MacCheckbox default-value="indeterminate">
      Indeterminate
    </MacCheckbox>
  </div>
</template>
