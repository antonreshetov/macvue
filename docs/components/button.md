# Button

A macOS push button (`NSButton`). Supports default, prominent, and destructive variants in the five standard control sizes.

<ComponentPreview name="button/Basic">

<<< @/demos/button/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacButton } from '@macvue/core'
</script>

<template>
  <MacButton>Click me</MacButton>
</template>
```

## Variants

<ComponentPreview name="button/Variants">

<<< @/demos/button/Variants.vue

</ComponentPreview>

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="button/Sizes">

<<< @/demos/button/Sizes.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="button/Disabled">

<<< @/demos/button/Disabled.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `variant` | `'default' \| 'prominent' \| 'destructive'` | `'default'` |
| `disabled` | `boolean` | `false` |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Button label content. |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLButtonElement \| null>` | The underlying button element. |
| `focus` | `() => void` | Focuses the button. |
| `blur` | `() => void` | Removes focus from the button. |
