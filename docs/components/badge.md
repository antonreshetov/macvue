# Badge

A macOS sidebar count badge (`NSTableCellView` badge): a translucent neutral capsule with secondary text. One size only — AppKit badges carry no `ControlSize`. The kits ship no badge masters, so the metrics are modeled on the live macOS sidebar.

<ComponentPreview name="badge/Basic">

<<< @/demos/badge/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacBadge } from 'macvue'
</script>

<template>
  <MacBadge>12</MacBadge>
</template>
```

## API

### Slots

| Slot | Description |
| --- | --- |
| `default` | Badge content, typically a count. |
