<script setup lang="ts" generic="T extends AcceptableValue = AcceptableValue">
import type { AcceptableValue, Direction } from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import type { MacControlSize } from '../../types'
import {
  SelectContent,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import GlassLens from '../glass/GlassLens.vue'
import { popUpMenuGlassPreset } from '../glass/glassPresets'
import './pop-up-button.css'

export interface MacPopUpButtonProps<T = AcceptableValue> {
  modelValue?: T
  defaultValue?: T
  open?: boolean
  defaultOpen?: boolean
  size?: MacControlSize
  disabled?: boolean
  required?: boolean
  name?: string
  autocomplete?: string
  by?: string | ((a: T, b: T) => boolean)
  dir?: Direction
  placeholder?: string
  /** Portal target. Pass false to keep the menu in a scoped theme container. */
  teleportTo?: string | false
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacPopUpButtonProps<T>>(), {
  size: 'regular',
  disabled: false,
  required: false,
  placeholder: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: T]
  'update:open': [value: boolean]
}>()

defineSlots<{
  default?: () => any
  value?: (props: {
    selectedLabel: string[]
    modelValue: T | undefined
  }) => any
}>()

const delegated = computed(() => {
  const {
    size: _size,
    placeholder: _placeholder,
    teleportTo: _teleportTo,
    ...rest
  } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegated, emit)
const attrs = useAttrs()

const trigger = ref<ComponentPublicInstance | null>(null)
const el = computed<HTMLButtonElement | null>(() => trigger.value?.$el ?? null)
const glassAvailable = ref(false)

function valueSlotProps(slotProps: {
  selectedLabel: string[]
  modelValue: AcceptableValue | AcceptableValue[] | undefined
}) {
  return {
    selectedLabel: slotProps.selectedLabel,
    // This wrapper never enables Select's multiple mode.
    modelValue: slotProps.modelValue as T | undefined,
  }
}

const triggerClasses = computed(() => [
  'macvue-pop-up-button',
  `macvue-pop-up-button--${props.size}`,
])

const contentClasses = computed(() => [
  'macvue-pop-up-button-content',
  `macvue-pop-up-button-content--${props.size}`,
])

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <div class="macvue-pop-up-button-anchor">
    <SelectRoot v-bind="forwarded">
      <SelectTrigger
        ref="trigger"
        v-bind="attrs"
        :class="triggerClasses"
      >
        <SelectValue
          v-if="$slots.value"
          class="macvue-pop-up-button-value"
          :placeholder="placeholder"
        >
          <template #default="slotProps">
            <slot
              name="value"
              v-bind="valueSlotProps(slotProps)"
            />
          </template>
        </SelectValue>
        <SelectValue
          v-else
          class="macvue-pop-up-button-value"
          :placeholder="placeholder"
        />
        <svg
          class="macvue-pop-up-button-chevron"
          viewBox="0 0 8 12"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M1 4 4 1l3 3M1 8l3 3 3-3" />
        </svg>
      </SelectTrigger>

      <SelectPortal
        :to="teleportTo || undefined"
        :disabled="teleportTo === false"
      >
        <SelectContent
          :class="contentClasses"
          position="item-aligned"
        >
          <div
            class="macvue-pop-up-button-menu"
            :data-macvue-glass-ready="glassAvailable ? '' : undefined"
          >
            <GlassLens
              lens-class="macvue-pop-up-button-menu-lens"
              filter-class="macvue-pop-up-button-menu-filter"
              :preset="popUpMenuGlassPreset"
              @availability="glassAvailable = $event"
            />
            <SelectViewport class="macvue-pop-up-button-viewport">
              <slot />
            </SelectViewport>
          </div>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>
