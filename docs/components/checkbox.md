# Checkbox

A macOS checkbox. Supports checked, unchecked, and mixed (indeterminate) states; clicking the caption toggles the control, just like an `NSButton` title.

<ComponentPreview name="checkbox/Basic">

<<< @/demos/checkbox/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacCheckbox } from 'macvue'
import { ref } from 'vue'

const checked = ref(false)
</script>

<template>
  <MacCheckbox v-model="checked">
    Show file extensions
  </MacCheckbox>
</template>
```

## States

Pass `defaultValue` for uncontrolled usage. The model accepts `'indeterminate'` for the mixed state; clicking a mixed checkbox resolves it to checked.

<ComponentPreview name="checkbox/States">

<<< @/demos/checkbox/States.vue

</ComponentPreview>

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="checkbox/Sizes">

<<< @/demos/checkbox/Sizes.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="checkbox/Disabled">

<<< @/demos/checkbox/Disabled.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `boolean \| 'indeterminate'` | — |
| `defaultValue` | `boolean \| 'indeterminate'` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | — |
| `value` | `string` | `'on'` |
| `required` | `boolean` | `false` |

With `name` set, the checkbox renders a hidden input inside a `<form>` and participates in native form submission.

### Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `boolean \| 'indeterminate'` |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Checkbox caption. |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLButtonElement \| null>` | The underlying checkbox button. |
| `focus` | `() => void` | Focuses the checkbox. |
| `blur` | `() => void` | Removes focus from the checkbox. |
