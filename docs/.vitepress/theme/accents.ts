export interface AccentOption {
  name: string
  value: string
}

// var() references resolve where they are applied, so swatches follow the
// library palette instead of hardcoding hex values.
export const accentOptions: AccentOption[] = [
  { name: 'Blue', value: 'var(--macvue-ref-blue)' },
  { name: 'Purple', value: 'var(--macvue-ref-purple)' },
  { name: 'Pink', value: 'var(--macvue-ref-pink)' },
  { name: 'Red', value: 'var(--macvue-ref-red)' },
  { name: 'Orange', value: 'var(--macvue-ref-orange)' },
  { name: 'Yellow', value: 'var(--macvue-ref-yellow)' },
  { name: 'Green', value: 'var(--macvue-ref-green)' },
  { name: 'Gray', value: 'var(--macvue-ref-gray)' },
]

export const defaultAccent = accentOptions[0].value
