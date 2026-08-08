<script setup lang="ts">
import { MacSegment, MacSegmentedControl } from 'macvue'
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
    <MacSegmentedControl
      disabled
      default-value="list"
      aria-label="Disabled group"
    >
      <MacSegment value="list">
        List
      </MacSegment>
      <MacSegment value="icons">
        Icons
      </MacSegment>
    </MacSegmentedControl>
    <MacSegmentedControl
      default-value="list"
      aria-label="Disabled segment"
    >
      <MacSegment value="list">
        List
      </MacSegment>
      <MacSegment
        value="icons"
        disabled
      >
        Icons
      </MacSegment>
      <MacSegment value="columns">
        Columns
      </MacSegment>
    </MacSegmentedControl>
  </div>
</template>
