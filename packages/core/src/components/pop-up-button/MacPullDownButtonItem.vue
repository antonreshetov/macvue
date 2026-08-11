<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import { DropdownMenuItem } from 'reka-ui'
import { computed, ref } from 'vue'
import './pop-up-button.css'

export interface MacPullDownButtonItemProps {
  disabled?: boolean
  textValue?: string
}

withDefaults(defineProps<MacPullDownButtonItemProps>(), {
  disabled: false,
})

const emit = defineEmits<{
  select: [event: Event]
}>()

const item = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLElement | null>(() => item.value?.$el ?? null)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <DropdownMenuItem
    ref="item"
    class="macvue-pop-up-button-item macvue-pull-down-button-item"
    :disabled="disabled"
    :text-value="textValue"
    @select="emit('select', $event)"
  >
    <slot />
  </DropdownMenuItem>
</template>
