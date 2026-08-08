# Progress

A macOS progress bar (`NSProgressIndicator`, bar style). Omit `value` (or pass `null`) for the indeterminate state — an accent comet ping-pongs across the track. The control is display-only, so there is no `v-model`. It labels itself `Progress` by default; pass `label` (or an `aria-label`) to override. With reduced motion enabled the comet is replaced by a static muted fill.

<ComponentPreview name="progress/Basic">

<<< @/demos/progress/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacProgress } from 'macvue'
</script>

<template>
  <MacProgress
    :value="40"
    aria-label="Copying"
  />
</template>
```

## Indeterminate

<ComponentPreview name="progress/Indeterminate">

<<< @/demos/progress/Indeterminate.vue

</ComponentPreview>

## Sizes

The bar ships in two sizes — `regular` (10px) and `small` (6px) — the only two in the reference kit.

<ComponentPreview name="progress/Sizes">

<<< @/demos/progress/Sizes.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `number \| null` | `null` (indeterminate) |
| `max` | `number` | `100` |
| `size` | `'regular' \| 'small'` | `'regular'` |
| `label` | `string` | `'Progress'` |
