# Help Button

A macOS help button (`NSButton` `.helpButton`): a circular neutral button with a question mark that opens contextual help. The circle diameter follows the button height scale; the glyph is exposed only through the `label` (default `Help`).

<ComponentPreview name="help-button/Basic">

<<< @/demos/help-button/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacHelpButton } from '@macvue/core'
</script>

<template>
  <MacHelpButton @click="openHelp" />
</template>
```

## Sizes

All five macOS control sizes; `regular` is the default.

<ComponentPreview name="help-button/Sizes">

<<< @/demos/help-button/Sizes.vue

</ComponentPreview>

## Disabled

<ComponentPreview name="help-button/Disabled">

<<< @/demos/help-button/Disabled.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `label` | `string` | `'Help'` |

### Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLButtonElement \| null>` | The underlying button element. |
| `focus` | `() => void` | Focuses the button. |
| `blur` | `() => void` | Removes focus from the button. |
