<script setup lang="ts">
import { MacSwitch } from 'macvue'
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    "
  >
    <MacSwitch
      size="extra-large"
      default-value
    >
      Extra large
    </MacSwitch>
    <MacSwitch
      size="large"
      default-value
    >
      Large
    </MacSwitch>
    <MacSwitch
      size="regular"
      default-value
    >
      Regular
    </MacSwitch>
    <MacSwitch
      size="small"
      default-value
    >
      Small
    </MacSwitch>
    <MacSwitch
      size="mini"
      default-value
    >
      Mini
    </MacSwitch>
  </div>
</template>
