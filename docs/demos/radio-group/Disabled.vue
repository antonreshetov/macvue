<script setup lang="ts">
import { MacRadio, MacRadioGroup } from 'macvue'
</script>

<template>
  <div style="display: flex; gap: 32px">
    <MacRadioGroup
      default-value="first"
      disabled
      aria-label="Disabled group"
    >
      <MacRadio value="first">
        Disabled group
      </MacRadio>
      <MacRadio value="second">
        Second
      </MacRadio>
    </MacRadioGroup>
    <MacRadioGroup
      default-value="first"
      aria-label="Group with disabled item"
    >
      <MacRadio value="first">
        Enabled item
      </MacRadio>
      <MacRadio
        value="second"
        disabled
      >
        Disabled item
      </MacRadio>
    </MacRadioGroup>
  </div>
</template>
