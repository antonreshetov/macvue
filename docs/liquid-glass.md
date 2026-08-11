# Liquid Glass

Liquid Glass is the macOS 26 material: a lens that refracts and brightens what sits behind it, rather than a flat translucent fill. MacVue implements it as an opt-in layer — components keep their CSS material until you enable refraction, and they fall back to it whenever the browser or the user's settings say so.

Drag the panels across the backdrop to see the edge refraction follow the content behind them.

<ComponentPreview name="glass-panel/Basic">

<<< @/demos/glass-panel/Basic.example.vue

</ComponentPreview>

## Turning it on

Refraction is off by default. Set `data-macvue-glass="on"` on any ancestor to enable it for that subtree:

```vue
<template>
  <div data-macvue-glass="on">
    <MacSlider v-model="volume" />
    <MacSwitch v-model="enabled" />
  </div>
</template>
```

The nearest `data-macvue-glass` boundary wins, so a nested `off` disables refraction locally without touching the rest of the page:

```vue
<template>
  <div data-macvue-glass="on">
    <MacGlassPanel>Refracted</MacGlassPanel>

    <div data-macvue-glass="off">
      <MacGlassPanel>CSS material only</MacGlassPanel>
    </div>
  </div>
</template>
```

The attribute expresses intent — this subtree may use Liquid Glass — not a rendering technique. Which components refract, and how, is decided by the components themselves and can change without touching your markup. There is no per-component optics prop.

## What each component does

[`MacGlassPanel`](/components/glass-panel) is a persistent surface: it refracts for as long as it is inside an enabled subtree, and its `material` prop chooses between `regular` (more blur and luminosity control, for alerts, sidebars and popovers) and `clear` (higher transparency over media-rich backdrops).

[`MacSlider`](/components/slider) and [`MacSwitch`](/components/switch) are interactive lenses. They keep their solid knob at the native size and switch to refraction only while the knob is pressed or dragged — the same way AppKit gives the standard controls the new appearance during interaction. They have no `regular`/`clear` axis, because the system does not offer that choice for them.

[`MacPopUpButton`](/components/pop-up-button) and [`MacPullDownButton`](/components/pop-up-button) apply the material to the open menu.

## Browser support

<Callout variant="warning" title="Chromium only">

Refraction currently requires Chromium. Safari and Firefox use the CSS material fallback: the panel keeps its translucent surface, and Slider and Switch keep their solid native-size knob.

</Callout>

The limit is not a policy choice. Refraction is built on an SVG displacement filter applied through `backdrop-filter`, and [WebKit bug 245510](https://bugs.webkit.org/show_bug.cgi?id=245510) — combining `backdrop-filter` with a `feDisplacementMap` filter — is still open. Support is feature-detected at runtime, and the solid presentation is never hidden until the check passes, so an unsupported browser shows the fallback rather than a broken control.

## Accessibility and degradation

The material is a presentation layer: it never changes behaviour, keyboard handling, form participation or ARIA state.

- `prefers-reduced-transparency: reduce` forces the opaque surface, even inside an enabled subtree.
- `forced-colors: active` drops the decorative layers and returns system colors, keeping states distinguishable.
- `prefers-contrast: more` strengthens the visible rim, so meaning never depends on transparency alone.
- `prefers-reduced-motion` zeroes the motion tokens; the material needs no animation to look correct.
- Focus stays on `:focus-visible`; neither the material nor its fallback adds a permanent outline.

If `backdrop-filter` is unsupported altogether, the base fill under the decorative layer keeps the control opaque and legible.

## Menus and scoped boundaries

Menus teleport to `body` by default, which puts them outside any locally scoped boundary — including `data-macvue-glass`. Keep a menu inside its boundary with `:teleport-to="false"`, or pass a selector pointing at a portal target within it. The same applies to scoped `data-macvue-appearance` and accent boundaries.

## How it works

MacVue generates a displacement map and a specular map on the client from the component's own geometry — measured layout size, computed corner radius and device pixel ratio — encodes them as data URLs and applies them through a shared SVG filter under `backdrop-filter`. Maps are regenerated on resize rather than scaled, so the refraction stays correct at every size and pixel density.

Nothing snapshots the DOM. There is no `foreignObject`, no canvas capture, no WebGL in the library — the backdrop stays the live page underneath.

<Callout title="Sources and prior art">

Apple is the visual source: [Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/), the [Liquid Glass technology overview](https://developer.apple.com/documentation/TechnologyOverviews/liquid-glass) and [HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials) define what the material is and where it belongs.

The SVG filter pipeline and the edge-refraction model were informed by [Kube's technical Liquid Glass article](https://kube.io/blog/liquid-glass-css-svg/). MacVue generates its own maps from measured geometry and calibrates them against native macOS references.

</Callout>

MacVue is not affiliated with Apple.
