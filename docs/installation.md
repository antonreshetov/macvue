# Installation

Install the package:

```sh
pnpm add macvue
```

Import the stylesheet once, at your app entry:

```ts
import 'macvue/style.css'
```

## Usage

```vue
<script setup lang="ts">
import { MacButton } from 'macvue'
</script>

<template>
  <MacButton variant="prominent">
    Click me
  </MacButton>
</template>
```

## Dark appearance

Appearance is controlled by the `data-macvue-appearance` attribute on any ancestor element (usually `<html>`):

```html
<html data-macvue-appearance="dark">
```

Use `light` to force light appearance, or `auto` to follow the system preference.
