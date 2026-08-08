import { computed, ref, useAttrs } from 'vue'

// class/style skin the visible wrapper; everything else (aria attributes,
// autocomplete, readonly, listeners) belongs on the actual input.
export function useFieldAttrs() {
  const attrs = useAttrs()
  const wrapperAttrs = computed(() => {
    // Only keys present in $attrs: an always-present `style` key would
    // SSR-render as an empty style="" attribute.
    const result: Record<string, unknown> = {}
    if ('class' in attrs)
      result.class = attrs.class
    if ('style' in attrs)
      result.style = attrs.style
    return result
  })
  const inputAttrs = computed(() => {
    const { class: _class, style: _style, ...rest } = attrs
    return rest
  })
  return { wrapperAttrs, inputAttrs }
}

export interface FieldModelProps {
  modelValue?: string
  defaultValue?: string
}

// Controlled + uncontrolled model for a native <input v-model>. Routing
// through the native v-model keeps Vue's IME handling: no intermediate
// updates are emitted while a composition session is open.
export function useFieldModel(
  props: FieldModelProps,
  emit: (event: 'update:modelValue', value: string) => void,
) {
  const internal = ref(props.defaultValue ?? '')
  return computed<string>({
    get: () => props.modelValue ?? internal.value,
    set: (value) => {
      internal.value = value
      emit('update:modelValue', value)
    },
  })
}
