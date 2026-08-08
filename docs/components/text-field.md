# Text Field

A macOS single-line text field (`NSTextField`). The focus ring appears on any focus, keyboard or pointer — the macOS behavior for text input. There is no built-in label: pair the field with your own label element or an `aria-label`.

<ComponentPreview name="text-field/Basic">

<<< @/demos/text-field/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacTextField } from 'macvue'
import { ref } from 'vue'

const name = ref('')
</script>

<template>
  <MacTextField
    v-model="name"
    aria-label="Name"
  />
</template>
```

## Labelling

The field ships without a built-in label — `NSTextField` labels are separate elements. Pair it with a `<label for>`: the `id` falls through to the inner input.

<ComponentPreview name="text-field/Labelled">

<<< @/demos/text-field/Labelled.vue

</ComponentPreview>

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="text-field/Sizes">

<<< @/demos/text-field/Sizes.vue

</ComponentPreview>

## Placeholder

Native attributes such as `autocomplete`, `readonly` and `maxlength` fall through to the inner `<input>`; `class` and `style` land on the wrapper.

<ComponentPreview name="text-field/Placeholder">

<<< @/demos/text-field/Placeholder.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="text-field/Disabled">

<<< @/demos/text-field/Disabled.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string` | — |
| `defaultValue` | `string` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `placeholder` | `string` | — |
| `name` | `string` | — |
| `required` | `boolean` | `false` |

With `name` set, the field participates in native form submission.

### Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `string` |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLInputElement \| null>` | The underlying input element. |
| `focus` | `() => void` | Focuses the input. |
| `blur` | `() => void` | Removes focus from the input. |
