# Separator

A hairline separator (`NSBox` with the `.separator` type in AppKit). Exposed with the `separator` role and correct `aria-orientation`; `decorative` hides it from assistive technology entirely.

<ComponentPreview name="separator/Basic">

<<< @/demos/separator/Basic.vue

</ComponentPreview>

## Vertical

The vertical separator stretches to its container height.

<ComponentPreview name="separator/Vertical">

<<< @/demos/separator/Vertical.vue

</ComponentPreview>

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` |
| `decorative` | `boolean` | `false` |
