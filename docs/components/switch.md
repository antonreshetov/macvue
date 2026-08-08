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
| `el` | `Ref<HTMLButtonElement \| null>` | The underlying switch button. |
| `focus` | `() => void` | Focuses the switch. |
| `blur` | `() => void` | Removes focus from the switch. |
