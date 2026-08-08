<script setup lang="ts">
import { MacRadio, MacRadioGroup } from 'macvue'
</script>

<template>
  <MacRadioGroup
    default-value="left"
    orientation="horizontal"
    aria-label="Text alignment"
  >
    <MacRadio value="left">
      Left
    </MacRadio>
    <MacRadio value="center">
      Center
    </MacRadio>
    <MacRadio value="right">
      Right
    </MacRadio>
  </MacRadioGroup>
</template>
