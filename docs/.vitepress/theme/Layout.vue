<script setup lang="ts">
import { Content, useData, useRoute, withBase } from 'vitepress'
import { computed } from 'vue'
import AppearanceToggle from './components/AppearanceToggle.vue'

const { theme, page } = useData()
const route = useRoute()

// route.path keeps `.html` on direct loads even with cleanUrls enabled.
const currentPath = computed(() => route.path.replace(/\.html$/, ''))

function isActive(link: string) {
  return currentPath.value === link
}

function isExternal(link: string) {
  return link.startsWith('http')
}

function resolveHref(link: string) {
  return isExternal(link) ? link : withBase(link)
}
</script>

<template>
  <div class="mv-app">
    <header class="mv-header">
      <div class="mv-header-inner">
        <a
          class="mv-logo"
          :href="withBase('/')"
        >macvue</a>
        <nav class="mv-nav">
          <a
            v-for="item in theme.nav"
            :key="item.link"
            class="mv-nav-link"
            :class="{ 'mv-nav-link--active': isActive(item.link) }"
            :href="resolveHref(item.link)"
            :target="isExternal(item.link) ? '_blank' : undefined"
            :rel="isExternal(item.link) ? 'noreferrer' : undefined"
          >
            {{ item.text }}
          </a>
        </nav>
        <AppearanceToggle />
      </div>
    </header>

    <div
      v-if="page.isNotFound"
      class="mv-not-found"
    >
      <h1>Page not found</h1>
      <p><a :href="withBase('/')">Back to home</a></p>
    </div>

    <div
      v-else
      class="mv-container"
    >
      <aside class="mv-sidebar">
        <div
          v-for="group in theme.sidebar"
          :key="group.text"
          class="mv-sidebar-group"
        >
          <p class="mv-sidebar-title">
            {{ group.text }}
          </p>
          <a
            v-for="item in group.items"
            :key="item.link"
            class="mv-sidebar-link"
            :class="{ 'mv-sidebar-link--active': isActive(item.link) }"
            :href="withBase(item.link)"
          >
            {{ item.text }}
          </a>
        </div>
      </aside>

      <main class="mv-content">
        <Content />
      </main>
    </div>
  </div>
</template>
