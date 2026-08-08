# Stepper

A macOS stepper (`NSStepper`): two stacked segments that increment and decrement a number. Press-and-hold auto-repeats with acceleration. The whole control is a single tab stop with `role="spinbutton"`; the segments themselves stay out of the tab order — keyboard users step with the arrow keys.

<ComponentPreview name="stepper/Basic">

<<< @/demos/stepper/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacStepper } from 'macvue'
import { ref } from 'vue'

const copies = ref(1)
</script>

<template>
  <MacStepper
    v-model="copies"
    :min="1"
    :max="99"
    aria-label="Copies"
  />
</template>
```

Keyboard: Up/Down step by `step`, Home/End jump to `min`/`max`.

## With a text field

The classic AppKit pairing — a text field and a stepper over one value. A dedicated number-field composite is planned; until then the pairing is a pattern.

<ComponentPreview name="stepper/WithTextField">

<<< @/demos/stepper/WithTextField.vue

</ComponentPreview>

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="stepper/Sizes">

<<< @/demos/stepper/Sizes.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="stepper/Disabled">

<<< @/demos/stepper/Disabled.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `number` | — |
| `defaultValue` | `number` | — |
| `min` | `number` | `0` |
| `max` | `number` | `100` |
| `step` | `number` | `1` |
| `wraps` | `boolean` | `false` |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | — |

`wraps` mirrors `NSStepper.valueWraps`: stepping past a bound continues from the opposite one. With `name` set, a hidden input carries the value in native form submission.

### Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `number` |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLDivElement \| null>` | The spinbutton root element. |
| `focus` | `() => void` | Focuses the stepper. |
| `blur` | `() => void` | Removes focus from the stepper. |
