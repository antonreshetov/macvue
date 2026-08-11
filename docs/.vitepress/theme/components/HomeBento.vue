<script setup lang="ts">
import {
  MacButton,
  MacCheckbox,
  MacGlassPanel,
  MacProgress,
  MacSearchField,
  MacSegment,
  MacSegmentedControl,
  MacSlider,
  MacSpinner,
  MacStepper,
  MacSwitch,
} from '@macvue/core'
import { ref } from 'vue'
import AccentSwatches from './AccentSwatches.vue'
import SceneSettings from './scenes/SceneSettings.vue'
import SiteFooter from './SiteFooter.vue'

const enabled = ref(true)
const level = ref(64)
const steps = ref(5)
const query = ref('')
const agreed = ref(true)
const tileAppearance = ref<'light' | 'dark'>('dark')
const accent = ref('var(--macvue-ref-blue)')
const panelAppearance = ref<'light' | 'dark'>('dark')
</script>

<template>
  <section
    class="mv-bento"
    aria-labelledby="mv-bento-title"
    :style="{ '--macvue-accent': accent }"
  >
    <div class="mv-bento-heading">
      <div>
        <p class="mv-kicker">
          What you get
        </p>
        <h2 id="mv-bento-title">
          The whole control set.
        </h2>
      </div>
      <a href="/components/">Explore all components →</a>
    </div>

    <div class="mv-bento-grid">
      <article class="mv-tile mv-tile--control mv-tile--w2">
        <MacSwitch
          v-model="enabled"
          size="extraLarge"
          aria-label="Switch demo"
        />
        <p class="mv-tile-label">
          Switch
        </p>
      </article>

      <article class="mv-tile mv-tile--w2">
        <p class="mv-tile-top">
          Ships with
        </p>
        <strong class="mv-tile-figure">19</strong>
        <p class="mv-tile-label">
          Components
        </p>
      </article>

      <article class="mv-tile mv-tile--w2">
        <p class="mv-tile-top">
          Every control in
        </p>
        <strong class="mv-tile-figure">5</strong>
        <p class="mv-tile-label">
          Sizes, mini to extraLarge
        </p>
      </article>

      <article
        class="mv-tile mv-tile--control mv-tile--appearance mv-tile--w3"
        :data-macvue-appearance="tileAppearance"
        :style="{ '--macvue-accent': accent }"
      >
        <MacSegmentedControl
          v-model="tileAppearance"
          aria-label="Appearance"
        >
          <MacSegment value="light">
            Light
          </MacSegment>
          <MacSegment value="dark">
            Dark
          </MacSegment>
        </MacSegmentedControl>
        <p class="mv-tile-label">
          Both appearances, one token set
        </p>
      </article>

      <article
        class="mv-tile mv-tile--glass mv-tile--w3 mv-tile--h2"
        data-macvue-glass="on"
      >
        <div class="mv-tile-glass-grid" />
        <strong class="mv-tile-glass-claim">Liquid Glass with real refraction</strong>
        <MacGlassPanel
          material="clear"
          class="mv-tile-glass-panel"
        >
          <MacSlider
            v-model="level"
            aria-label="Liquid Glass slider"
          />
          <MacSwitch
            v-model="enabled"
            aria-label="Liquid Glass switch"
          />
        </MacGlassPanel>
        <p class="mv-tile-label">
          Refraction in Chromium, material fallback elsewhere
        </p>
      </article>

      <article class="mv-tile mv-tile--accent mv-tile--w3">
        <p class="mv-tile-top">
          System accents
        </p>
        <AccentSwatches v-model="accent" />
      </article>

      <article class="mv-tile mv-tile--panel mv-tile--w6 mv-tile--h2">
        <SceneSettings
          v-model:appearance="panelAppearance"
          :accent="accent"
        />
      </article>

      <article class="mv-tile mv-tile--control mv-tile--w3">
        <span class="mv-tile-row">
          <MacSearchField
            v-model="query"
            aria-label="Search demo"
            placeholder="Search"
          />
          <MacButton variant="prominent"> Continue </MacButton>
        </span>
        <MacCheckbox v-model="agreed">
          Remember this Mac
        </MacCheckbox>
        <p class="mv-tile-label">
          Search Field · Button · Checkbox
        </p>
      </article>

      <article class="mv-tile mv-tile--control mv-tile--w3">
        <span class="mv-tile-row">
          <MacProgress
            :value="62"
            aria-label="Progress demo"
          />
          <MacSpinner label="Working" />
          <MacStepper
            v-model="steps"
            :min="0"
            :max="10"
            aria-label="Stepper demo"
          />
        </span>
        <p class="mv-tile-label">
          Progress · Spinner · Stepper
        </p>
      </article>

      <article class="mv-tile mv-tile--claim mv-tile--w4">
        <strong>Measured against AppKit,<br>not guessed</strong>
      </article>

      <article class="mv-tile mv-tile--w4">
        <p class="mv-tile-top">
          Built for
        </p>
        <strong class="mv-tile-figure mv-tile-figure--small">Vue 3</strong>
        <p class="mv-tile-label">
          TypeScript types included
        </p>
      </article>

      <article class="mv-tile mv-tile--w2">
        <p class="mv-tile-top">
          Whole library
        </p>
        <strong class="mv-tile-figure mv-tile-figure--small">25 kB</strong>
        <p class="mv-tile-label">
          Gzipped, JS and CSS
        </p>
      </article>

      <article class="mv-tile mv-tile--w2">
        <p class="mv-tile-top">
          Released under
        </p>
        <strong class="mv-tile-figure mv-tile-figure--small">MIT</strong>
        <p class="mv-tile-label">
          Use it anywhere
        </p>
      </article>
    </div>

    <SiteFooter />
  </section>
</template>
