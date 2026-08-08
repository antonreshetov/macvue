<script setup lang="ts">
import { onContentUpdated } from 'vitepress'
import { ref } from 'vue'

interface Heading {
  id: string
  text: string
  level: number
}

// Filled from the DOM after each content render; SSR and the hydration pass
// both see an empty list, so the markup stays deterministic.
const headings = ref<Heading[]>([])

onContentUpdated(() => {
  headings.value = Array.from(
    document.querySelectorAll<HTMLHeadingElement>('.mv-content :is(h2, h3)'),
  )
    .filter(el => el.id)
    .map(el => ({
      id: el.id,
      // Strip the zero-width space of the trailing header anchor.
      text: (el.textContent ?? '').replace(/\u200B/g, '').trim(),
      level: Number(el.tagName[1]),
    }))
})
</script>

<template>
  <nav
    v-if="headings.length"
    class="mv-aside"
    aria-label="On this page"
  >
    <p class="mv-aside-title">
      On this page
    </p>
    <a
      v-for="heading in headings"
      :key="heading.id"
      class="mv-aside-link"
      :class="{ 'mv-aside-link--h3': heading.level === 3 }"
      :href="`#${heading.id}`"
    >
      {{ heading.text }}
    </a>
  </nav>
</template>
