# Glass Panel

A macOS Liquid Glass surface (`NSGlassEffectView`) for custom controls and media overlays.

Use `regular` when content needs stronger blur and luminosity control. Use `clear` over media-rich backgrounds where preserving backdrop detail is more important.

The base panel keeps its CSS material fallback. Add `data-macvue-glass="on"` to an ancestor to enable edge refraction; the nearest `data-macvue-glass` boundary wins, so a nested `off` disables refraction locally. Reduced transparency uses an opaque surface, and forced colors uses system colors.

<Callout variant="warning" title="Browser support">

The refracted surface currently requires Chromium. Safari and Firefox automatically use the CSS material fallback.

</Callout>

<Callout title="Implementation reference">

The SVG filter pipeline and edge-refraction model were informed by [Kube's technical Liquid Glass article](https://kube.io/blog/liquid-glass-css-svg/). MacVue generates its own maps from the panel geometry and calibrates them against native macOS references.

</Callout>

<ComponentPreview name="glass-panel/Basic">

<<< @/demos/glass-panel/Basic.vue

</ComponentPreview>

## Usage

```vue
<script setup lang="ts">
import { MacGlassPanel } from 'macvue'
</script>

<template>
  <div data-macvue-glass="on">
    <MacGlassPanel material="clear">
      Media controls
    </MacGlassPanel>
  </div>
</template>
```

## API

### Props

| Prop | Type | Default |
| --- | --- | --- |
| `material` | `'regular' \| 'clear'` | `'regular'` |

### Slots

| Slot | Description |
| --- | --- |
| `default` | Panel content. |
