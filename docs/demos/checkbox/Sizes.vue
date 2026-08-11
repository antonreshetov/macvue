<script setup lang="ts">
import { MacCheckbox } from '@macvue/core'
</script>

<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    "
  >
    <MacCheckbox
      size="extra-large"
      default-value
    >
      Extra large
    </MacCheckbox>
    <MacCheckbox
      size="large"
      default-value
    >
      Large
    </MacCheckbox>
    <MacCheckbox
      size="regular"
      default-value
    >
      Regular
    </MacCheckbox>
    <MacCheckbox
      size="small"
      default-value
    >
      Small
    </MacCheckbox>
    <MacCheckbox
      size="mini"
      default-value
    >
      Mini
    </MacCheckbox>
  </div>
</template>
