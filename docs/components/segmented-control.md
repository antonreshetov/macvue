# Segmented Control

A macOS segmented control (`NSSegmentedControl`). Segments share the container width equally — the AppKit default distribution. In single mode the accent selection slides between segments; a selected segment cannot be deselected by clicking it again, matching AppKit. Tahoe has a single visual style, so there is no `variant`; momentary (button-like) segments are not modeled — use `MacButton`s for that.

<ComponentPreview name="segmented-control/Basic">

<<< @/demos/segmented-control/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacSegment, MacSegmentedControl } from 'macvue'
import { ref } from 'vue'

const view = ref('list')
</script>

<template>
  <MacSegmentedControl
    v-model="view"
    aria-label="View"
  >
    <MacSegment value="list">
      List
    </MacSegment>
    <MacSegment value="icons">
      Icons
    </MacSegment>
  </MacSegmentedControl>
</template>
```

Arrow keys move focus between segments; Space or Enter selects the focused segment.

## Multiple

`type="multiple"` switches the model to an array (`selectAny` in AppKit). Selected segments can be toggled off; there is no sliding pill.

<ComponentPreview name="segmented-control/Multiple">

<<< @/demos/segmented-control/Multiple.vue

</ComponentPreview>

## Sizes

All five macOS control sizes; `regular` is the default. Large and extra-large are capsules.

<ComponentPreview name="segmented-control/Sizes">

<<< @/demos/segmented-control/Sizes.vue

</ComponentPreview>

## Disabled

The whole group or individual segments.

<ComponentPreview name="segmented-control/Disabled">

<<< @/demos/segmented-control/Disabled.vue

</ComponentPreview>

## API

### MacSegmentedControl Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string \| string[]` | — |
| `defaultValue` | `string \| string[]` | — |
| `type` | `'single' \| 'multiple'` | `'single'` |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | — |

With `name` set, hidden inputs carry the selection in native form submission.

### MacSegmentedControl Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `string \| string[]` |

### MacSegmentedControl Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLElement \| null>` | The group element. |
| `focus` | `() => void` | Focuses the current segment. |
| `blur` | `() => void` | Removes focus from the group. |

### MacSegment Props

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | — (required) |
| `disabled` | `boolean` | `false` |

### MacSegment Slots

| Slot | Description |
| --- | --- |
| `default` | Segment label content. |
