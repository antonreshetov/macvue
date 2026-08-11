# Pop-Up Button

A macOS pop-up button (`NSPopUpButton`). The two AppKit modes ship as separate components: `MacPopUpButton` chooses and displays one value, `MacPullDownButton` runs a command and does not retain a selection. Both share the trigger scale and the menu material; only their selection and command semantics differ.

<ComponentPreview name="pop-up-button/Basic">

<<< @/demos/pop-up-button/Basic.vue

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

All five macOS control sizes; `regular` is the default. The matrix keeps Pop-Up and Pull-Down triggers side by side so their native menu registration can be compared at every size.

<ComponentPreview name="pop-up-button/Sizes">

<<< @/demos/pop-up-button/Sizes.vue

</ComponentPreview>

## Liquid Glass

Liquid Glass is experimental and disabled by default. The open menu uses the stable CSS material until an ancestor explicitly sets `data-macvue-glass="on"`; `data-macvue-glass="off"` and reduced transparency keep the fallback.

Because the menu teleports to `body` by default, keep it inside the glass boundary with `:teleport-to="false"`, or provide a portal target inside that boundary. See the [Liquid Glass guide](/liquid-glass) for the opt-in boundary, fallbacks and prior art.

<Callout variant="warning" title="Browser support">

The refracted menu currently requires Chromium. Safari and Firefox automatically use the CSS material fallback.

</Callout>

<ComponentPreview name="pop-up-button/Glass">

<<< @/demos/pop-up-button/Glass.example.vue

</ComponentPreview>

## Disabled

Disable the whole control or individual items.

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

With `name` set, the button participates in native form submission.

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

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLButtonElement \| null>` | The semantic trigger button. |
| `focus` | `() => void` | Focuses the trigger. |
| `blur` | `() => void` | Removes focus from the trigger. |

### MacPopUpButtonItem Props

| Prop | Type | Default |
| --- | --- | --- |
| `value` | generic acceptable value | — (required) |
| `disabled` | `boolean` | `false` |
| `textValue` | `string` | item text |

Set `textValue` when the item content is not plain text. An empty-string `value` is reserved for clearing the selection and is not a valid item value.

### MacPopUpButtonItem Slots

| Slot | Description |
| --- | --- |
| `default` | Item label; may contain custom inline content. |

### MacPopUpButtonItem Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLElement \| null>` | The underlying menu item element. |
| `focus` | `() => void` | Focuses the item. |
| `blur` | `() => void` | Removes focus from the item. |

### MacPullDownButton Props

| Prop | Type | Default |
| --- | --- | --- |
| `open` (`v-model:open`) | `boolean` | — |
| `defaultOpen` | `boolean` | — |
| `size` | `'extra-large' \| 'large' \| 'regular' \| 'small' \| 'mini'` | `'regular'` |
| `disabled` | `boolean` | `false` |
| `dir` | `'ltr' \| 'rtl'` | inherited |
| `label` | `string` | `''` |
| `teleportTo` | `string \| false` | `body` |

### MacPullDownButton Events

| Event | Payload |
| --- | --- |
| `update:open` | `boolean` |

### MacPullDownButton Slots

| Slot | Description |
| --- | --- |
| `default` | `MacPullDownButtonItem` commands. |
| `trigger` | Replaces `label`; without either, the trigger is the compact chevron-only form. |

### MacPullDownButton Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLButtonElement \| null>` | The semantic trigger button. |
| `focus` | `() => void` | Focuses the trigger. |
| `blur` | `() => void` | Removes focus from the trigger. |

### MacPullDownButtonItem Props

| Prop | Type | Default |
| --- | --- | --- |
| `disabled` | `boolean` | `false` |
| `textValue` | `string` | item text |

### MacPullDownButtonItem Events

| Event | Payload |
| --- | --- |
| `select` | `Event` — cancellable |

### MacPullDownButtonItem Slots

| Slot | Description |
| --- | --- |
| `default` | Command label. |

### MacPullDownButtonItem Exposed

| Name | Type | Description |
| --- | --- | --- |
| `el` | `Ref<HTMLElement \| null>` | The underlying menu item element. |
| `focus` | `() => void` | Focuses the item. |
| `blur` | `() => void` | Removes focus from the item. |
