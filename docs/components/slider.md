# Slider

A macOS linear slider (`NSSlider`). The knob is a lozenge, wider than tall; the model is a plain number. Range (multi-thumb) selection is not supported — `NSSlider` has a single knob.

<ComponentPreview name="slider/Basic">

<<< @/demos/slider/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacSlider } from 'macvue'
import { ref } from 'vue'

const volume = ref(50)
</script>

<template>
  <MacSlider
    v-model="volume"
    aria-label="Volume"
  />
</template>
```

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="slider/Sizes">

<<< @/demos/slider/Sizes.vue

</ComponentPreview>

## Tick marks

`ticks` renders evenly spaced marks under the track. With `snapToTicks` the step is derived from the tick count: `step = (max - min) / (ticks - 1)`.

<ComponentPreview name="slider/Ticks">

<<< @/demos/slider/Ticks.vue

</ComponentPreview>

## Vertical

The vertical geometry is an interpolation — the reference kit has horizontal masters only.

<ComponentPreview name="slider/Vertical">

<<< @/demos/slider/Vertical.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="slider/Disabled">

<<< @/demos/slider/Disabled.vue

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
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `ticks` | `number` | — |
| `snapToTicks` | `boolean` | `false` |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | — |

With `name` set, the slider participates in native form submission.

### Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `number` — on every change |
| `valueCommit` | `number` — once at the end of an interaction |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLElement \| null>` | The focusable knob element. |
| `focus` | `() => void` | Focuses the knob. |
| `blur` | `() => void` | Removes focus from the knob. |
