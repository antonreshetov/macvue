# Pop-Up Button

A Tahoe-style pair matching the two `NSPopUpButton` modes. `MacPopUpButton` chooses and displays one value. `MacPullDownButton` runs a command and does not retain a selection.

Both controls share the same compact trigger scale and stable menu material, while keeping their different selection and command semantics explicit. Experimental Liquid Glass refraction is opt-in.

<ComponentPreview name="pop-up-button/Basic">

<<< @/demos/pop-up-button/Basic.vue

</ComponentPreview>

## Liquid Glass

Liquid Glass is experimental and disabled by default. The open menu uses the stable CSS material until an ancestor explicitly sets `data-macvue-glass="on"`. The isolated preview below enables it explicitly, following the same pattern as Switch. Safari, Firefox, reduced transparency, and `data-macvue-glass="off"` keep the fallback.

Because the menu teleports to `body` by default, keep it inside the glass boundary with `:teleport-to="false"`, or provide a portal target inside that boundary. The 24px grid below makes displacement at the rounded edge visible.

<ComponentPreview name="pop-up-button/Glass">

<<< @/demos/pop-up-button/Glass.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import {
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
} from 'macvue'
import { ref } from 'vue'

const color = ref('red')
</script>

<template>
  <MacPopUpButton
    v-model="color"
    aria-label="Color"
  >
    <MacPopUpButtonItem value="red">
      Red
    </MacPopUpButtonItem>
    <MacPopUpButtonItem value="green">
      Green
    </MacPopUpButtonItem>
  </MacPopUpButton>
</template>
```

Use the command-oriented companion without modelling a selected value:

```vue
<MacPullDownButton aria-label="Actions">
  <MacPullDownButtonItem @select="createDocument">
    New
  </MacPullDownButtonItem>
  <MacPullDownButtonItem @select="openDocument">
    Open…
  </MacPullDownButtonItem>
</MacPullDownButton>
```

## Sizes

Both modes follow the five-size AppKit control scale. The matrix keeps Pop-Up and Pull-Down triggers side by side so their native menu registration can be compared at every size. `regular` is 24px high.

<ComponentPreview name="pop-up-button/Sizes">

<<< @/demos/pop-up-button/Sizes.vue

</ComponentPreview>

## States

Items and the whole control can be disabled.

<ComponentPreview name="pop-up-button/States">

<<< @/demos/pop-up-button/States.vue

</ComponentPreview>

## Scoped themes and portals

The menu teleports to `body` by default. When the control lives inside a locally scoped `data-macvue-appearance`, accent, or glass boundary, set `:teleport-to="false"` to render the menu beside the trigger and preserve that inherited context. A selector can be supplied as a custom portal target.

## API

### MacPopUpButton Props

| Prop | Type | Default |
| --- | --- | --- |
| `modelValue` (`v-model`) | generic acceptable value | — |
| `defaultValue` | generic acceptable value | — |
| `open` (`v-model:open`) | `boolean` | — |
| `defaultOpen` | `boolean` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `required` | `boolean` | `false` |
| `name` | `string` | — |
| `autocomplete` | `string` | — |
| `by` | `string \| ((a, b) => boolean)` | — |
| `dir` | `'ltr' \| 'rtl'` | inherited |
| `placeholder` | `string` | `''` |
| `teleportTo` | `string \| false` | `body` |

### MacPopUpButton Events

| Event | Payload |
| --- | --- |
| `update:modelValue` | selected value |
| `update:open` | `boolean` |

### MacPopUpButton Slots

| Slot | Description |
| --- | --- |
| `default` | `MacPopUpButtonItem` children. |
| `value` | Custom trigger label; receives `selectedLabel` and `modelValue`. |

### MacPopUpButton Exposed

`el`, `focus()`, and `blur()` target the semantic trigger button.

### MacPopUpButtonItem

| Prop | Type | Default |
| --- | --- | --- |
| `value` | generic acceptable value | — (required) |
| `disabled` | `boolean` | `false` |
| `textValue` | `string` | item text |

The default slot is the item label and may contain custom inline content. Set `textValue` when that content is not plain text. An empty-string `value` is reserved for clearing the selection and is not a valid item value.

### MacPullDownButton

| Prop | Type | Default |
| --- | --- | --- |
| `open` (`v-model:open`) | `boolean` | — |
| `defaultOpen` | `boolean` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `dir` | `'ltr' \| 'rtl'` | inherited |
| `label` | `string` | `''` |
| `teleportTo` | `string \| false` | `body` |

The default slot contains `MacPullDownButtonItem` commands. The optional `trigger` slot replaces `label`; without either, the trigger is the compact chevron-only form. Items emit a cancellable `select` event.
