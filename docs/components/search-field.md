# Search Field

A macOS search field (`NSSearchField`): a capsule at every size, with a magnifier on the left and a clear button that appears when the field is non-empty. Escape clears the field; the clear button sits outside the tab order, as in macOS.

<ComponentPreview name="search-field/Basic">

<<< @/demos/search-field/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacSearchField } from 'macvue'
import { ref } from 'vue'

const query = ref('')
</script>

<template>
  <MacSearchField
    v-model="query"
    aria-label="Search"
  />
</template>
```

The placeholder defaults to `Search`.

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="search-field/Sizes">

<<< @/demos/search-field/Sizes.vue

</ComponentPreview>

## Clearing

The clear button empties the field and returns focus to the input. Keyboard users clear with Escape.

<ComponentPreview name="search-field/Clearing">

<<< @/demos/search-field/Clearing.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string` | — |
| `defaultValue` | `string` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `placeholder` | `string` | `'Search'` |
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
