<script setup lang="ts">
import type { Direction } from 'reka-ui'
import type { ComponentPublicInstance } from 'vue'
import type { MacControlSize } from '../../types'
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  useForwardPropsEmits,
} from 'reka-ui'
import { computed, ref, useAttrs } from 'vue'
import GlassLens from '../glass/GlassLens.vue'
import { popUpMenuGlassPreset } from '../glass/glassPresets'
import './pop-up-button.css'

export interface MacPullDownButtonProps {
  open?: boolean
  defaultOpen?: boolean
  size?: MacControlSize
  disabled?: boolean
  dir?: Direction
  label?: string
  /** Portal target. Pass false to keep the menu in a scoped theme container. */
  teleportTo?: string | false
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<MacPullDownButtonProps>(), {
  size: 'regular',
  disabled: false,
  label: '',
})

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const slots = defineSlots<{
  default?: () => any
  trigger?: () => any
}>()

const delegated = computed(() => {
  const {
    size: _size,
    disabled: _disabled,
    label: _label,
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

const triggerClasses = computed(() => [
  'macvue-pop-up-button',
  'macvue-pull-down-button',
  `macvue-pop-up-button--${props.size}`,
  { 'macvue-pull-down-button--icon-only': !props.label && !slots.trigger },
])

const contentClasses = computed(() => [
  'macvue-pull-down-button-content',
  `macvue-pop-up-button-content--${props.size}`,
])

const sideOffset = computed(
  () =>
    ({
      'mini': 0,
      'small': 1,
      'regular': 2,
      'large': 2,
      'extra-large': 2,
    })[props.size],
)

defineExpose({
  el,
  focus: () => el.value?.focus(),
  blur: () => el.value?.blur(),
})
</script>

<template>
  <div class="macvue-pop-up-button-anchor">
    <DropdownMenuRoot v-bind="forwarded">
      <DropdownMenuTrigger
        ref="trigger"
        v-bind="attrs"
        :class="triggerClasses"
        :disabled="disabled"
      >
        <span
          v-if="label || $slots.trigger"
          class="macvue-pop-up-button-value"
        >
          <slot name="trigger">
            {{ label }}
          </slot>
        </span>
        <svg
          class="macvue-pull-down-button-chevron"
          viewBox="0 0 8 5"
          fill="none"
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="m1 1 3 3 3-3" />
        </svg>
      </DropdownMenuTrigger>

      <DropdownMenuPortal
        :to="teleportTo || undefined"
        :disabled="teleportTo === false"
      >
        <DropdownMenuContent
          :class="contentClasses"
          align="start"
          :side-offset="sideOffset"
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
            <div class="macvue-pop-up-button-viewport">
              <slot />
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>
