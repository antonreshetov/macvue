<script setup lang="ts">
import { Content, useData, useRoute, withBase } from 'vitepress'
import { computed, onUnmounted, ref, watch } from 'vue'
import AppearanceToggle from './components/AppearanceToggle.vue'
import HomePage from './components/HomePage.vue'
import OnThisPage from './components/OnThisPage.vue'
import PrevNext from './components/PrevNext.vue'

const { theme, page, frontmatter } = useData()
const route = useRoute()

// route.path keeps `.html` on direct loads even with cleanUrls enabled.
const currentPath = computed(() => route.path.replace(/\.html$/, ''))

const isHome = computed(() => frontmatter.value.layout === 'home')

const menuEl = ref<HTMLDetailsElement | null>(null)

function closeMenu() {
  if (menuEl.value?.open)
    menuEl.value.open = false
}

function onDocumentClick(event: MouseEvent) {
  if (menuEl.value && !menuEl.value.contains(event.target as Node))
    closeMenu()
}

function onDocumentKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape')
    closeMenu()
}

function removeMenuListeners() {
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onDocumentKeydown)
}

// Document listeners live only while the menu is open.
function onMenuToggle() {
  if (menuEl.value?.open) {
    document.addEventListener('click', onDocumentClick)
    document.addEventListener('keydown', onDocumentKeydown)
  }
  else {
    removeMenuListeners()
  }
}

onUnmounted(removeMenuListeners)

watch(() => route.path, closeMenu)

function isActive(link: string) {
  return currentPath.value === link
}

// Nav items point at section entries, so they stay lit across the section.
function isNavActive(link: string) {
  if (isExternal(link))
    return false
  const prefix = link.replace(/\/$/, '')
  return prefix === ''
    ? currentPath.value === '/'
    : currentPath.value.startsWith(prefix)
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
            :class="{ 'mv-nav-link--active': isNavActive(item.link) }"
            :href="resolveHref(item.link)"
            :target="isExternal(item.link) ? '_blank' : undefined"
            :rel="isExternal(item.link) ? 'noreferrer' : undefined"
          >
            {{ item.text }}
          </a>
        </nav>
        <details
          ref="menuEl"
          class="mv-menu"
          @toggle="onMenuToggle"
        >
          <summary>Menu</summary>
          <div class="mv-menu-panel">
            <div class="mv-sidebar-group">
              <a
                v-for="item in theme.nav"
                :key="item.link"
                class="mv-sidebar-link"
                :href="resolveHref(item.link)"
                :target="isExternal(item.link) ? '_blank' : undefined"
                :rel="isExternal(item.link) ? 'noreferrer' : undefined"
              >
                {{ item.text }}
              </a>
            </div>
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
          </div>
        </details>
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

    <HomePage v-else-if="isHome" />

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

      <main class="mv-main">
        <Content class="mv-content" />
        <PrevNext />
      </main>

      <OnThisPage />
    </div>
  </div>
</template>
