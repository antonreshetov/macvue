<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { ref } from 'vue'
import HeroOptics from './HeroOptics.vue'
import HomeBento from './HomeBento.vue'

const { frontmatter } = useData()
const copied = ref(false)

function isExternal(link: string) {
  return link.startsWith('http')
}

async function copyInstall() {
  await navigator.clipboard.writeText('pnpm add @macvue/core')
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1600)
}
</script>

<template>
  <main
    class="mv-home"
    data-macvue-appearance="dark"
  >
    <section
      class="mv-hero mv-hero--panel"
      aria-labelledby="mv-hero-title"
    >
      <div class="mv-hero-copy">
        <p class="mv-kicker">
          MacVue v0.1.0
        </p>
        <h1
          id="mv-hero-title"
          class="mv-hero-title"
        >
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
            :href="
              isExternal(action.link) ? action.link : withBase(action.link)
            "
            :target="isExternal(action.link) ? '_blank' : undefined"
            :rel="isExternal(action.link) ? 'noreferrer' : undefined"
          >
            {{ action.text }}
          </a>
        </div>
        <button
          class="mv-install"
          type="button"
          @click="copyInstall"
        >
          <span aria-hidden="true">$</span>
          <code>pnpm add @macvue/core</code>
          <span class="mv-install-copy">{{ copied ? "Copied" : "Copy" }}</span>
        </button>
      </div>

      <div
        class="mv-hero-visual"
        data-macvue-glass="on"
      >
        <HeroOptics variant="aurora-panel" />
      </div>
    </section>

    <HomeBento />
  </main>
</template>
