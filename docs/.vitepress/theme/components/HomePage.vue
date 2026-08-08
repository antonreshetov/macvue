<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { ref } from 'vue'
import { defaultAccent } from '../accents'
import AccentSwatches from './AccentSwatches.vue'
import ComponentCardGrid from './ComponentCardGrid.vue'
import SceneControls from './scenes/SceneControls.vue'
import SceneDialog from './scenes/SceneDialog.vue'
import SceneSettings from './scenes/SceneSettings.vue'

const { frontmatter } = useData()

// 'light' by default so SSR markup does not depend on the visitor's theme.
const appearance = ref<'light' | 'dark'>('light')
const accent = ref(defaultAccent)

function isExternal(link: string) {
  return link.startsWith('http')
}
</script>

<template>
  <div class="mv-home">
    <section class="mv-hero">
      <h1 class="mv-hero-title">
        {{ frontmatter.hero?.title }}
      </h1>
      <p class="mv-hero-tagline">
        {{ frontmatter.hero?.tagline }}
      </p>
      <div class="mv-hero-actions">
        <a
          v-for="action in frontmatter.hero?.actions ?? []"
          :key="action.link"
          class="mv-cta"
          :class="{ 'mv-cta--primary': action.variant === 'prominent' }"
          :href="isExternal(action.link) ? action.link : withBase(action.link)"
          :target="isExternal(action.link) ? '_blank' : undefined"
          :rel="isExternal(action.link) ? 'noreferrer' : undefined"
        >
          {{ action.text }}
        </a>
      </div>

      <div class="mv-hero-scene">
        <SceneSettings
          v-model:appearance="appearance"
          :accent="accent"
        />
      </div>

      <div class="mv-hero-controls">
        <div
          class="mv-segment"
          role="group"
          aria-label="Scene appearance"
        >
          <button
            type="button"
            class="mv-segment-button"
            :class="{ 'mv-segment-button--active': appearance === 'light' }"
            @click="appearance = 'light'"
          >
            Light
          </button>
          <button
            type="button"
            class="mv-segment-button"
            :class="{ 'mv-segment-button--active': appearance === 'dark' }"
            @click="appearance = 'dark'"
          >
            Dark
          </button>
        </div>
        <AccentSwatches v-model="accent" />
      </div>
    </section>

    <h2 class="mv-home-section-title">
      Real pieces, live on the page
    </h2>
    <section class="mv-bento">
      <div class="mv-bento-card">
        <SceneDialog />
      </div>
      <div class="mv-bento-card">
        <SceneControls />
      </div>
    </section>

    <h2 class="mv-home-section-title">
      Explore the components
    </h2>
    <ComponentCardGrid />
  </div>
</template>
