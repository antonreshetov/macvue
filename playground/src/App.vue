<script setup lang="ts">
import {
  MacButton,
  MacCheckbox,
  MacRadio,
  MacRadioGroup,
  MacSearchField,
  MacSecureField,
  MacSwitch,
  MacTextField,
} from 'macvue'
import { ref } from 'vue'

type Appearance = 'light' | 'dark' | 'auto'

const appearances: Appearance[] = ['light', 'dark', 'auto']
const appearance = ref<Appearance>('auto')

function setAppearance(value: Appearance) {
  appearance.value = value
  document.documentElement.dataset.macvueAppearance = value
}

setAppearance(appearance.value)

interface AccentSwatch {
  name: string
  light: string
  dark: string
}

const accents: AccentSwatch[] = [
  { name: 'blue', light: '#007AFF', dark: '#0A84FF' },
  { name: 'purple', light: '#AF52DE', dark: '#BF5AF2' },
  { name: 'pink', light: '#FF2D55', dark: '#FF375F' },
  { name: 'red', light: '#FF3B30', dark: '#FF453A' },
  { name: 'orange', light: '#FF9500', dark: '#FF9F0A' },
  { name: 'yellow', light: '#FFCC00', dark: '#FFD60A' },
  { name: 'green', light: '#34C759', dark: '#30D158' },
  { name: 'gray', light: '#8E8E93', dark: '#98989D' },
]

const accent = ref('blue')

function setAccent(swatch: AccentSwatch) {
  accent.value = swatch.name
  // The light value is enough for the demo: the point is watching the
  // derived tokens (hover/pressed/focus-ring) recompute from the cascade.
  document.documentElement.style.setProperty('--macvue-accent', swatch.light)
}

const derivatives = [
  { label: 'accent', variable: '--macvue-accent' },
  { label: 'accent-hover', variable: '--macvue-accent-hover' },
  { label: 'accent-pressed', variable: '--macvue-accent-pressed' },
  { label: 'selection-bg', variable: '--macvue-selection-bg' },
]

const labels = [
  { label: 'label', variable: '--macvue-label' },
  { label: 'label-secondary', variable: '--macvue-label-secondary' },
  { label: 'label-tertiary', variable: '--macvue-label-tertiary' },
  { label: 'label-quaternary', variable: '--macvue-label-quaternary' },
  { label: 'destructive', variable: '--macvue-destructive' },
]

const surfaces = [
  { label: 'window-bg', variable: '--macvue-window-bg' },
  { label: 'control-bg', variable: '--macvue-control-bg' },
  { label: 'control', variable: '--macvue-control' },
  { label: 'control-pressed', variable: '--macvue-control-pressed' },
  { label: 'content-bg', variable: '--macvue-content-bg' },
  { label: 'under-page-bg', variable: '--macvue-under-page-bg' },
]

const textStyles = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption-1',
  'caption-2',
]

const buttonSizes = [
  'extra-large',
  'large',
  'regular',
  'small',
  'mini',
] as const
const buttonVariants = ['default', 'prominent', 'destructive'] as const

const checkboxChecked = ref(true)
const checkboxMixed = ref<boolean | 'indeterminate'>('indeterminate')
const radioValue = ref('name')
const switchOn = ref(true)
const fieldValue = ref('')
const fieldPassword = ref('')
const fieldQuery = ref('')

function textStyleCss(name: string) {
  return {
    fontSize: `var(--macvue-text-${name}-size)`,
    lineHeight: `var(--macvue-text-${name}-leading)`,
    fontWeight: `var(--macvue-text-${name}-weight)`,
  }
}
</script>

<template>
  <main class="page">
    <header class="header">
      <h1 class="title">
        macvue tokens
      </h1>

      <div class="controls">
        <div class="segmented">
          <button
            v-for="value in appearances"
            :key="value"
            type="button"
            class="segment"
            :class="{ active: appearance === value }"
            @click="setAppearance(value)"
          >
            {{ value }}
          </button>
        </div>

        <div class="swatches">
          <button
            v-for="swatch in accents"
            :key="swatch.name"
            type="button"
            class="swatch"
            :class="{ active: accent === swatch.name }"
            :style="{ background: swatch.light }"
            :title="swatch.name"
            @click="setAccent(swatch)"
          />
        </div>
      </div>
    </header>

    <section class="section">
      <h2 class="section-title">
        Accent derivatives
      </h2>
      <div class="tiles">
        <figure
          v-for="item in derivatives"
          :key="item.variable"
          class="tile"
        >
          <div
            class="tile-color"
            :style="{ background: `var(${item.variable})` }"
          />
          <figcaption class="tile-caption">
            {{ item.label }}
          </figcaption>
        </figure>
        <figure class="tile">
          <div class="tile-color tile-focus" />
          <figcaption class="tile-caption">
            focus-ring
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Labels
      </h2>
      <div class="labels">
        <p
          v-for="item in labels"
          :key="item.variable"
          class="label-row"
          :style="{ color: `var(${item.variable})` }"
        >
          {{ item.label }} — The quick brown fox jumps over the lazy dog
        </p>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Surfaces
      </h2>
      <div class="tiles">
        <figure
          v-for="item in surfaces"
          :key="item.variable"
          class="tile"
        >
          <div
            class="tile-color tile-surface"
            :style="{ background: `var(${item.variable})` }"
          />
          <figcaption class="tile-caption">
            {{ item.label }}
          </figcaption>
        </figure>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Button
      </h2>
      <div class="button-rows">
        <div
          v-for="variant in buttonVariants"
          :key="variant"
          class="button-row"
        >
          <span class="button-row-name">{{ variant }}</span>
          <MacButton
            v-for="size in buttonSizes"
            :key="size"
            :variant="variant"
            :size="size"
          >
            {{ size }}
          </MacButton>
        </div>
        <div class="button-row">
          <span class="button-row-name">disabled</span>
          <MacButton
            v-for="variant in buttonVariants"
            :key="variant"
            :variant="variant"
            disabled
          >
            {{ variant }}
          </MacButton>
        </div>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Checkbox
      </h2>
      <div class="control-column">
        <MacCheckbox v-model="checkboxChecked">
          Checked ({{ checkboxChecked }})
        </MacCheckbox>
        <MacCheckbox v-model="checkboxMixed">
          Mixed ({{ checkboxMixed }})
        </MacCheckbox>
        <MacCheckbox disabled>
          Disabled
        </MacCheckbox>
        <MacCheckbox
          :default-value="true"
          disabled
        >
          Disabled checked
        </MacCheckbox>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Radio
      </h2>
      <MacRadioGroup
        v-model="radioValue"
        aria-label="Sort by"
      >
        <MacRadio value="name">
          Name
        </MacRadio>
        <MacRadio value="kind">
          Kind
        </MacRadio>
        <MacRadio
          value="date"
          disabled
        >
          Date modified (disabled)
        </MacRadio>
      </MacRadioGroup>
    </section>

    <section class="section">
      <h2 class="section-title">
        Switch
      </h2>
      <div class="control-column">
        <MacSwitch v-model="switchOn">
          Wi-Fi ({{ switchOn ? "on" : "off" }})
        </MacSwitch>
        <MacSwitch disabled>
          Disabled off
        </MacSwitch>
        <MacSwitch
          :default-value="true"
          disabled
        >
          Disabled on
        </MacSwitch>
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Text fields
      </h2>
      <div class="control-column">
        <MacTextField
          v-model="fieldValue"
          aria-label="Name"
          placeholder="Name"
        />
        <MacSecureField
          v-model="fieldPassword"
          aria-label="Password"
          placeholder="Password"
        />
        <MacSearchField
          v-model="fieldQuery"
          aria-label="Search"
        />
        <MacTextField
          disabled
          model-value="Disabled value"
          aria-label="Disabled"
        />
      </div>
    </section>

    <section class="section">
      <h2 class="section-title">
        Text styles
      </h2>
      <div class="text-styles">
        <div
          v-for="name in textStyles"
          :key="name"
          class="text-row"
        >
          <span class="text-name">{{ name }}</span>
          <span :style="textStyleCss(name)">The quick brown fox</span>
        </div>
      </div>
    </section>
  </main>
</template>

<style>
body {
  margin: 0;
  background: var(--macvue-window-bg);
}
</style>

<style scoped>
.page {
  min-height: 100vh;
  padding: 32px;
  display: grid;
  gap: 32px;
  align-content: start;
  background: var(--macvue-window-bg);
  color: var(--macvue-label);
  font-family: var(--macvue-font-family);
}

.header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.title {
  margin: 0;
  font-size: var(--macvue-text-large-title-size);
  line-height: var(--macvue-text-large-title-leading);
  font-weight: var(--macvue-text-large-title-weight);
}

.controls {
  display: flex;
  align-items: center;
  gap: 16px;
}

.segmented {
  display: flex;
  border: 1px solid var(--macvue-border-control);
  border-radius: 6px;
  overflow: hidden;
}

.segment {
  padding: 4px 12px;
  border: none;
  background: var(--macvue-control-bg);
  color: var(--macvue-label);
  font: inherit;
  font-size: var(--macvue-text-body-size);
  cursor: pointer;
}

.segment + .segment {
  border-left: 1px solid var(--macvue-separator);
}

.segment.active {
  background: var(--macvue-accent);
  color: #fff;
}

.swatches {
  display: flex;
  gap: 8px;
}

.swatch {
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
}

.swatch.active {
  outline: var(--macvue-focus-ring-width) solid var(--macvue-focus-ring);
}

.section {
  display: grid;
  gap: 12px;
}

.section-title {
  margin: 0;
  font-size: var(--macvue-text-title-2-size);
  line-height: var(--macvue-text-title-2-leading);
  font-weight: var(--macvue-text-headline-weight);
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 12px;
}

.tile {
  margin: 0;
  display: grid;
  gap: 6px;
}

.tile-color {
  height: 64px;
  border-radius: 8px;
}

.tile-surface {
  border: 1px solid var(--macvue-separator);
}

.tile-focus {
  background: var(--macvue-content-bg);
  border: var(--macvue-focus-ring-width) solid var(--macvue-focus-ring);
}

.tile-caption {
  font-size: var(--macvue-text-caption-1-size);
  line-height: var(--macvue-text-caption-1-leading);
  color: var(--macvue-label-secondary);
}

.labels {
  display: grid;
  gap: 4px;
  padding: 16px;
  border-radius: 8px;
  background: var(--macvue-window-bg);
  border: 1px solid var(--macvue-separator);
}

.label-row {
  margin: 0;
  font-size: var(--macvue-text-body-size);
  line-height: var(--macvue-text-body-leading);
}

.button-rows {
  display: grid;
  gap: 12px;
}

.button-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.button-row-name {
  width: 120px;
  font-size: var(--macvue-text-caption-1-size);
  color: var(--macvue-label-secondary);
}

.control-column {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.text-styles {
  display: grid;
  gap: 8px;
}

.text-row {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: baseline;
  gap: 16px;
}

.text-name {
  font-size: var(--macvue-text-caption-1-size);
  color: var(--macvue-label-secondary);
}
</style>
