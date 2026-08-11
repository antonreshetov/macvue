<script setup lang="ts">
import type { Component } from 'vue'
import { MacButton } from '@macvue/core'
import { computed, ref } from 'vue'

const props = defineProps<{ name: string }>()

const demos = import.meta.glob<{ default: Component }>(
  '../../../demos/**/*.vue',
  { eager: true },
)

const demo = computed(() => demos[`../../../demos/${props.name}.vue`]?.default)

const tab = ref<'preview' | 'code'>('preview')
const codeEl = ref<HTMLElement | null>(null)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')

const copyLabel = computed(() => {
  if (copyState.value === 'copied')
    return 'Copied'
  if (copyState.value === 'failed')
    return 'Failed'
  return 'Copy'
})

async function copy() {
  // Copy exactly what the highlighted snippet in the slot shows.
  const text = codeEl.value?.querySelector('pre')?.textContent ?? ''
  try {
    await navigator.clipboard.writeText(text)
    copyState.value = 'copied'
  }
  catch {
    copyState.value = 'failed'
  }
  setTimeout(() => {
    copyState.value = 'idle'
  }, 1500)
}
</script>

<template>
  <div class="mv-preview">
    <div
      class="mv-preview-tabs"
      role="tablist"
    >
      <button
        type="button"
        role="tab"
        class="mv-preview-tab"
        :class="{ 'mv-preview-tab--active': tab === 'preview' }"
        :aria-selected="tab === 'preview'"
        @click="tab = 'preview'"
      >
        Preview
      </button>
      <button
        type="button"
        role="tab"
        class="mv-preview-tab"
        :class="{ 'mv-preview-tab--active': tab === 'code' }"
        :aria-selected="tab === 'code'"
        @click="tab = 'code'"
      >
        Code
      </button>
    </div>

    <div
      v-show="tab === 'preview'"
      class="mv-preview-stage"
    >
      <component
        :is="demo"
        v-if="demo"
      />
      <p v-else>
        Demo "{{ name }}" not found.
      </p>
    </div>

    <div
      v-show="tab === 'code'"
      ref="codeEl"
      class="mv-preview-code"
    >
      <div class="mv-preview-copy">
        <MacButton
          size="small"
          @click="copy"
        >
          {{ copyLabel }}
        </MacButton>
      </div>
      <slot />
    </div>
  </div>
</template>
