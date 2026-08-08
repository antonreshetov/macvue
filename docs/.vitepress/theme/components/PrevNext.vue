<script setup lang="ts">
import { useData, useRoute, withBase } from 'vitepress'
import { computed } from 'vue'

interface SidebarLink {
  text: string
  link: string
}

const { theme } = useData()
const route = useRoute()

const links = computed<SidebarLink[]>(() =>
  (theme.value.sidebar ?? []).flatMap(
    (group: { items?: SidebarLink[] }) => group.items ?? [],
  ),
)

// route.path keeps `.html` on direct loads even with cleanUrls enabled.
const currentPath = computed(() => route.path.replace(/\.html$/, ''))

const index = computed(() =>
  links.value.findIndex(item => item.link === currentPath.value),
)

const prev = computed(() =>
  index.value > 0 ? links.value[index.value - 1] : undefined,
)

const next = computed(() =>
  index.value === -1 ? undefined : links.value[index.value + 1],
)
</script>

<template>
  <footer
    v-if="prev || next"
    class="mv-prev-next"
  >
    <a
      v-if="prev"
      class="mv-prev-next-link"
      :href="withBase(prev.link)"
    >
      <span class="mv-prev-next-label">Previous</span>
      <span class="mv-prev-next-title">{{ prev.text }}</span>
    </a>
    <a
      v-if="next"
      class="mv-prev-next-link mv-prev-next-link--next"
      :href="withBase(next.link)"
    >
      <span class="mv-prev-next-label">Next</span>
      <span class="mv-prev-next-title">{{ next.text }}</span>
    </a>
  </footer>
</template>
