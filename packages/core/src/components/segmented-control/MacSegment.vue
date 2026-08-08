<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { ToggleGroupItem } from 'reka-ui'
import { computed, ref } from 'vue'
import './segmented.css'

export interface MacSegmentProps {
  value: string
  disabled?: boolean
}

const props = defineProps<MacSegmentProps>()

// Not useTemplateRef: it landed in Vue 3.5 and the peer range starts at 3.4.
// ComponentPublicInstance because Reka components are generic function
// components with no construct signature for InstanceType.
const item = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLButtonElement | null>(() => item.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <ToggleGroupItem
    ref="item"
    :value="props.value"
    :disabled="disabled"
    class="macvue-segment"
  >
    <slot />
  </ToggleGroupItem>
</template>
