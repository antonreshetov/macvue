# Secure Field

A macOS password field (`NSSecureTextField`). Identical to Text Field except the input is masked. Like its AppKit prototype it has no reveal-password affordance.

<ComponentPreview name="secure-field/Basic">

<<< @/demos/secure-field/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacSecureField } from 'macvue'
import { ref } from 'vue'

const password = ref('')
</script>

<template>
  <MacSecureField
    v-model="password"
    aria-label="Password"
    autocomplete="current-password"
  />
</template>
```

## Disabled

<ComponentPreview name="secure-field/Disabled">

<<< @/demos/secure-field/Disabled.vue

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
