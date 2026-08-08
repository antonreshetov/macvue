// @vitest-environment jsdom
import type { MacSecureFieldProps } from '../src'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacSecureField } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

// A password input has no implicit ARIA role, so queries go by label.
function renderField(
  props: MacSecureFieldProps & Record<string, unknown> = {},
) {
  const merged: MacSecureFieldProps & Record<string, unknown> = {
    'aria-label': 'Password',
    ...props,
  }
  return render(MacSecureField, { props: merged })
}

describe('macSecureField', () => {
  it('renders a password input with no reveal affordance', () => {
    const { getByLabelText, container } = renderField()
    const input = getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
    expect(container.querySelector('button')).toBeNull()
  })

  it('ignores a fallthrough type attribute — the input stays masked', () => {
    const { getByLabelText } = renderField({ type: 'text' })
    const input = getByLabelText('Password') as HTMLInputElement
    expect(input.type).toBe('password')
  })

  it('supports uncontrolled usage through defaultValue', async () => {
    const { getByLabelText } = renderField({ defaultValue: 'secret' })
    const input = getByLabelText('Password') as HTMLInputElement
    expect(input.value).toBe('secret')
    await userEvent.type(input, '!')
    expect(input.value).toBe('secret!')
  })

  it('emits update:modelValue on typing and follows the controlled value', async () => {
    const { getByLabelText, rerender, emitted } = renderField({
      modelValue: '',
    })
    const input = getByLabelText('Password') as HTMLInputElement
    await userEvent.type(input, 'a')
    expect(emitted('update:modelValue')).toEqual([['a']])

    await rerender({ 'aria-label': 'Password', 'modelValue': 'reset' })
    expect(input.value).toBe('reset')
  })

  it('renders a modifier class for every control size and keeps size off the input', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByLabelText, unmount } = renderField({ size })
      const input = getByLabelText('Password')
      expect(
        input
          .closest('.macvue-field')
          ?.classList
          .contains(`macvue-field--${size}`),
      ).toBe(true)
      expect(input.hasAttribute('size')).toBe(false)
      unmount()
    }
  })

  it('splits attrs: class/style go to the wrapper, the rest to the input', () => {
    const { getByLabelText } = renderField({
      class: 'custom',
      style: 'margin-top: 4px',
      autocomplete: 'current-password',
    })
    const input = getByLabelText('Password') as HTMLInputElement
    const wrapper = input.closest('.macvue-field') as HTMLElement
    expect(wrapper.classList.contains('custom')).toBe(true)
    expect(wrapper.style.marginTop).toBe('4px')
    expect(input.getAttribute('autocomplete')).toBe('current-password')
  })

  it('disables the input and suppresses input events', async () => {
    const { getByLabelText, emitted } = renderField({ disabled: true })
    const input = getByLabelText('Password') as HTMLInputElement
    expect(input.disabled).toBe(true)
    await userEvent.type(input, 'a')
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('exposes focus(), blur() and el pointing at the input', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLInputElement | null
    }
    let exposed: Exposed | undefined
    const { getByLabelText } = render({
      setup() {
        const field = ref<Exposed>()
        onMounted(() => {
          exposed = field.value
        })
        return () =>
          h(MacSecureField, { 'ref': field, 'aria-label': 'Password' })
      },
    })
    await nextTick()
    const input = getByLabelText('Password')

    expect(exposed!.el).toBe(input)
    exposed!.focus()
    expect(document.activeElement).toBe(input)
    exposed!.blur()
    expect(document.activeElement).not.toBe(input)
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacSecureField, { 'aria-label': 'Empty' }),
          h(MacSecureField, { 'aria-label': 'Filled', 'modelValue': 'secret' }),
          h(MacSecureField, { 'aria-label': 'Disabled', 'disabled': true }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
