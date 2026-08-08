// @vitest-environment jsdom
import type { MacSearchFieldProps } from '../src'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacSearchField } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderField(
  props: MacSearchFieldProps & Record<string, unknown> = {},
) {
  const merged: MacSearchFieldProps & Record<string, unknown> = {
    'aria-label': 'Search',
    ...props,
  }
  return render(MacSearchField, { props: merged })
}

describe('macSearchField', () => {
  it('renders a searchbox with the default Search placeholder and magnifier', () => {
    const { getByRole, container } = renderField()
    const input = getByRole('searchbox') as HTMLInputElement
    expect(input.type).toBe('search')
    expect(input.placeholder).toBe('Search')
    expect(container.querySelector('.macvue-field-search-icon')).toBeTruthy()
  })

  it('shows the clear button only when the value is non-empty', async () => {
    const { getByRole, queryByLabelText } = renderField()
    expect(queryByLabelText('Clear text')).toBeNull()

    await userEvent.type(getByRole('searchbox'), 'cats')
    expect(queryByLabelText('Clear text')).toBeTruthy()
  })

  it('keeps the clear button out of the tab order', async () => {
    const { queryByLabelText } = renderField({ modelValue: 'cats' })
    expect(queryByLabelText('Clear text')?.getAttribute('tabindex')).toBe('-1')
  })

  it('clears on clear-button click and returns focus to the input', async () => {
    const { getByRole, getByLabelText, queryByLabelText, emitted }
      = renderField({ defaultValue: 'cats' })
    const input = getByRole('searchbox') as HTMLInputElement

    await userEvent.click(getByLabelText('Clear text'))
    expect(input.value).toBe('')
    expect(emitted('update:modelValue')).toEqual([['']])
    expect(document.activeElement).toBe(input)
    expect(queryByLabelText('Clear text')).toBeNull()
  })

  it('clears on Escape', async () => {
    const { getByRole, emitted } = renderField({ defaultValue: 'cats' })
    const input = getByRole('searchbox') as HTMLInputElement
    input.focus()
    await userEvent.keyboard('{Escape}')
    expect(input.value).toBe('')
    expect(emitted('update:modelValue')).toEqual([['']])
  })

  it('emits update:modelValue on typing and follows the controlled value', async () => {
    const { getByRole, rerender, emitted } = renderField({ modelValue: '' })
    const input = getByRole('searchbox') as HTMLInputElement
    await userEvent.type(input, 'a')
    expect(emitted('update:modelValue')).toEqual([['a']])

    await rerender({ 'aria-label': 'Search', 'modelValue': 'kittens' })
    expect(input.value).toBe('kittens')
  })

  it('renders a modifier class for every control size and keeps size off the input', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = renderField({ size })
      const input = getByRole('searchbox')
      const wrapper = input.closest('.macvue-field')
      expect(wrapper?.classList.contains(`macvue-field--${size}`)).toBe(true)
      expect(wrapper?.classList.contains('macvue-field--search')).toBe(true)
      expect(input.hasAttribute('size')).toBe(false)
      unmount()
    }
  })

  it('splits attrs: class/style go to the wrapper, the rest to the input', () => {
    const { getByRole } = renderField({
      'class': 'custom',
      'style': 'margin-top: 4px',
      'aria-describedby': 'hint',
    })
    const input = getByRole('searchbox') as HTMLInputElement
    const wrapper = input.closest('.macvue-field') as HTMLElement
    expect(wrapper.classList.contains('custom')).toBe(true)
    expect(wrapper.style.marginTop).toBe('4px')
    expect(input.getAttribute('aria-describedby')).toBe('hint')
  })

  it('disables the input and the clear button', async () => {
    const { getByRole, getByLabelText, emitted } = renderField({
      disabled: true,
      modelValue: 'cats',
    })
    const input = getByRole('searchbox') as HTMLInputElement
    expect(input.disabled).toBe(true)
    const clear = getByLabelText('Clear text') as HTMLButtonElement
    expect(clear.disabled).toBe(true)
    await userEvent.click(clear)
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacSearchField, { 'aria-label': 'Empty' }),
          h(MacSearchField, { 'aria-label': 'Filled', 'modelValue': 'cats' }),
          h(MacSearchField, { 'aria-label': 'Disabled', 'disabled': true }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })
})
