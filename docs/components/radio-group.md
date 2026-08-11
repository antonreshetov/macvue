# Radio Group

A group of macOS radio buttons (`NSButton` `.radio`). Exactly one option is selected at a time; arrow keys move both focus and selection, and clicking a caption selects its radio.

<ComponentPreview name="radio-group/Basic">

<<< @/demos/radio-group/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacRadio, MacRadioGroup } from 'macvue'
import { ref } from 'vue'

const sortBy = ref('name')
</script>

<template>
  <MacRadioGroup
    v-model="sortBy"
    aria-label="Sort by"
  >
    <MacRadio value="name">
      Name
    </MacRadio>
    <MacRadio value="kind">
      Kind
    </MacRadio>
  </MacRadioGroup>
</template>
```

## Orientation

The group is vertical by default; set `orientation="horizontal"` for a row.

<ComponentPreview name="radio-group/Horizontal">

<<< @/demos/radio-group/Horizontal.vue

</ComponentPreview>

## Sizes

All five macOS control sizes; `regular` is the default. Like `controlSize` in AppKit, `size` is set on the group and inherited by every `MacRadio` in it — individual radios have no `size` prop.

<ComponentPreview name="radio-group/Sizes">

<<< @/demos/radio-group/Sizes.vue

</ComponentPreview>

## Disabled

Disable the whole group or individual radios.

<ComponentPreview name="radio-group/Disabled">

<<< @/demos/radio-group/Disabled.vue

</ComponentPreview>

## API

### MacRadioGroup Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | `string` | — |
| `defaultValue` | `string` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` |
| `name` | `string` | — |
| `required` | `boolean` | `false` |

`orientation` only affects the layout: all four arrow keys move the selection either way, as the ARIA radio-group pattern prescribes. With `name` set, the group renders a hidden input inside a `<form>` and participates in native form submission.

### MacRadioGroup Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | `string` |

### MacRadioGroup Slots

| Slot | Description |
| --- | --- |
| `default` | `MacRadio` items. |

### MacRadioGroup Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLElement \| null>` | The group element. |
| `focus` | `() => void` | Focuses the current radio in the group. |
| `blur` | `() => void` | Removes focus from the group. |

### MacRadio Props

| Prop | Type | Default |
| --- | --- | --- |
| `value` | `string` | — (required) |
| `disabled` | `boolean` | `false` |

### MacRadio Slots

| Slot | Description |
| --- | --- |
| `default` | Radio caption. |

### MacRadio Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLButtonElement \| null>` | The underlying radio button. |
| `focus` | `() => void` | Focuses the radio. |
| `blur` | `() => void` | Removes focus from the radio. |
