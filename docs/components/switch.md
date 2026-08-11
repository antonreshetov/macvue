# Switch

A macOS switch (`NSSwitch`). The caption sits to the left of the toggle, as in System Settings, and clicking it toggles the control. This is the only animated control in the library; the motion respects `prefers-reduced-motion`.

<ComponentPreview name="switch/Basic">

<<< @/demos/switch/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacSwitch } from 'macvue'
import { ref } from 'vue'

const enabled = ref(true)
</script>

<template>
  <MacSwitch v-model="enabled">
    Wi-Fi
  </MacSwitch>
</template>
```

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="switch/Sizes">

<<< @/demos/switch/Sizes.vue

</ComponentPreview>

## Liquid Glass

The base switch keeps its solid knob at the native size. Add `data-macvue-glass="on"` to an ancestor to enable Liquid Glass; the switch automatically shows its enlarged clicked lens only during press or drag. See the [Liquid Glass guide](/liquid-glass) for the opt-in boundary, fallbacks and prior art.

<Callout variant="warning" title="Browser support">

The refracted lens currently requires Chromium. Safari and Firefox automatically keep the solid native-size knob.

</Callout>

<ComponentPreview name="switch/Glass">

<<< @/demos/switch/Glass.example.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="switch/Disabled">

<<< @/demos/switch/Disabled.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `boolean` | — |
| `defaultValue` | `boolean` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `name` | `string` | — |
| `value` | `string` | `'on'` |
| `required` | `boolean` | `false` |

With `name` set, the switch renders a hidden input inside a `<form>` and participates in native form submission.

### Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `boolean` |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Switch caption. |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLInputElement \| null>` | The underlying range input. |
| `focus` | `() => void` | Focuses the switch. |
| `blur` | `() => void` | Removes focus from the switch. |
