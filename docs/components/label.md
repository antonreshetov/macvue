# Label

A macOS text label (a non-editable `NSTextField`). `variant` selects one of the eleven macOS text styles measured from the reference kit; `secondary` switches to `NSColor.secondaryLabelColor`.

<ComponentPreview name="label/Basic">

<<< @/demos/label/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacLabel } from 'macvue'
</script>

<template>
  <MacLabel variant="headline">
    Notifications
  </MacLabel>
</template>
```

## Variants

<ComponentPreview name="label/Variants">

<<< @/demos/label/Variants.vue

</ComponentPreview>

## Semantic tags

The rendered tag defaults to `<span>` and can be changed with `as` for semantic headings.

<Callout title="Layered styles yield to app CSS">

The library styles live in a CSS layer, so a consumer's unlayered global heading styles (`h3 { … }`) win over the label's text style by design — the same way any layered library style yields to app CSS.

</Callout>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `variant` | `'large-title' \| 'title-1' \| 'title-2' \| 'title-3' \| 'headline' \| 'body' \| 'callout' \| 'subheadline' \| 'footnote' \| 'caption-1' \| 'caption-2'` | `'body'` |
| `secondary` | `boolean` | `false` |
| `as` | `string` | `'span'` |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Label text content. |
