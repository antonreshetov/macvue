<script setup lang="ts">
import { MacRadio, MacRadioGroup } from 'macvue'
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 16px;
    "
  >
    <MacRadioGroup
      size="large"
      default-value="on"
      orientation="horizontal"
      aria-label="Large radios"
    >
      <MacRadio value="on">
        Large
      </MacRadio>
      <MacRadio value="off">
        Option
      </MacRadio>
    </MacRadioGroup>
    <MacRadioGroup
      size="regular"
      default-value="on"
      orientation="horizontal"
      aria-label="Regular radios"
    >
      <MacRadio value="on">
        Regular
      </MacRadio>
      <MacRadio value="off">
        Option
      </MacRadio>
    </MacRadioGroup>
    <MacRadioGroup
      size="mini"
      default-value="on"
      orientation="horizontal"
      aria-label="Mini radios"
    >
      <MacRadio value="on">
        Mini
      </MacRadio>
      <MacRadio value="off">
        Option
      </MacRadio>
    </MacRadioGroup>
  </div>
</template>
