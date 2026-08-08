# Spinner

A macOS asynchronous spinner (`NSProgressIndicator`, spinning style): eight capsule blades stepping through 45° increments. The rotation is discrete, as native, and deliberately keeps running under reduced motion — it is the only signal that work is happening. Exposed to assistive technology as an indeterminate progressbar.

<ComponentPreview name="spinner/Basic">

<<< @/demos/spinner/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacSpinner } from 'macvue'
</script>

<template>
  <MacSpinner label="Preparing…" />
</template>
```

## Sizes

Two sizes — `regular` (32px) and `small` (16px) — the only two in the reference kit.

<ComponentPreview name="spinner/Sizes">

<<< @/demos/spinner/Sizes.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `'regular' \| 'small'` | `'regular'` |
| `label` | `string` | `'Loading'` |
