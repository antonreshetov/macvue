# Box

A macOS group box (`NSBox`): a rounded container with a quaternary fill and no border, exactly as the Tahoe kit draws it. The optional title renders as a footnote-style caption above the box; the `#title` slot takes precedence over the `title` prop.

<ComponentPreview name="box/Basic">

<<< @/demos/box/Basic.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `title` | `string` | — |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Box content. |
| `title` | Caption above the box; wins over the `title` prop. |
