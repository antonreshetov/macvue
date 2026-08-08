// @vitest-environment jsdom
import type { MacTextFieldProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { fireEvent, render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacTextField } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderField(props: MacTextFieldProps & Record<string, unknown> = {}) {
  const merged: MacTextFieldProps & Record<string, unknown> = {
    'aria-label': 'Name',
    ...props,
  }
  return render(MacTextField, { props: merged })
}

describe('macTextField', () => {
  it('renders a text input inside the field wrapper', () => {
    const { getByRole } = renderField({ placeholder: 'Name' })
    const input = getByRole('textbox') as HTMLInputElement
    expect(input.tagName).toBe('INPUT')
    expect(input.type).toBe('text')
    expect(input.placeholder).toBe('Name')
    expect(input.closest('.macvue-field')).toBeTruthy()
  })

  it('supports uncontrolled usage through defaultValue', async () => {
    const { getByRole } = renderField({ defaultValue: 'Anton' })
    const input = getByRole('textbox') as HTMLInputElement
    expect(input.value).toBe('Anton')
    await userEvent.type(input, '!')
    expect(input.value).toBe('Anton!')
  })

  it('emits update:modelValue on typing and follows the controlled value', async () => {
    const { getByRole, rerender, emitted } = renderField({ modelValue: '' })
    const input = getByRole('textbox') as HTMLInputElement
    await userEvent.type(input, 'a')
    expect(emitted('update:modelValue')).toEqual([['a']])

    await rerender({ 'aria-label': 'Name', 'modelValue': 'from outside' })
    expect(input.value).toBe('from outside')
  })

  it('does not emit intermediate updates during an IME composition session', async () => {
    const { getByRole, emitted } = renderField({ modelValue: '' })
    const input = getByRole('textbox') as HTMLInputElement

    await fireEvent.compositionStart(input)
    input.value = 'に'
    await fireEvent.input(input)
    expect(emitted('update:modelValue')).toBeUndefined()

    await fireEvent.compositionEnd(input)
    expect(emitted('update:modelValue')).toEqual([['に']])
  })

  it('renders a modifier class for every control size and keeps size off the input', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = renderField({ size })
      const input = getByRole('textbox')
      expect(
        input
          .closest('.macvue-field')
          ?.classList
          .contains(`macvue-field--${size}`),
      ).toBe(true)
      // size is presentation-only and must not leak as an attribute.
      expect(input.hasAttribute('size')).toBe(false)
      unmount()
    }
  })

  it('splits attrs: class/style go to the wrapper, the rest to the input', () => {
    const { getByRole } = renderField({
      'class': 'custom',
      'style': 'margin-top: 4px',
      'autocomplete': 'name',
      'readonly': true,
      'maxlength': '10',
      'aria-describedby': 'hint',
    })
    const input = getByRole('textbox') as HTMLInputElement
    const wrapper = input.closest('.macvue-field') as HTMLElement
    expect(wrapper.classList.contains('custom')).toBe(true)
    expect(wrapper.style.marginTop).toBe('4px')
    expect(input.classList.contains('custom')).toBe(false)
    expect(input.getAttribute('autocomplete')).toBe('name')
    expect(input.hasAttribute('readonly')).toBe(true)
    expect(input.getAttribute('maxlength')).toBe('10')
    expect(input.getAttribute('aria-describedby')).toBe('hint')
  })

  it('disables the input and suppresses input events', async () => {
    const { getByRole, emitted } = renderField({ disabled: true })
    const input = getByRole('textbox') as HTMLInputElement
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
    const { getByRole } = render({
      setup() {
        const field = ref<Exposed>()
        onMounted(() => {
          exposed = field.value
        })
        return () => h(MacTextField, { 'ref': field, 'aria-label': 'Name' })
      },
    })
    await nextTick()
    const input = getByRole('textbox')

    expect(exposed!.el).toBeInstanceOf(HTMLInputElement)
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
          h(MacTextField, { 'aria-label': 'Empty' }),
          h(MacTextField, { 'aria-label': 'Filled', 'modelValue': 'Value' }),
          h(MacTextField, { 'aria-label': 'Disabled', 'disabled': true }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('field.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/text-field/field.css'),
        'utf8',
      )
    })

    it('has no :hover and no transition (macOS fields have neither)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
    })

    it('shows the ring on :focus-within, never :focus-visible (macOS fields ring on any focus)', () => {
      expect(css).toContain(':focus-within')
      expect(css).not.toContain(':focus-visible')
      // The focus ring must appear only under :focus-within.
      const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? []
      const ringRules = rules.filter(rule =>
        rule.includes('var(--macvue-focus-ring)'),
      )
      expect(ringRules.length).toBeGreaterThan(0)
      for (const rule of ringRules)
        expect(rule.slice(0, rule.indexOf('{'))).toContain(':focus-within')
    })

    it('suppresses the native input outline exactly once, on the inner input', () => {
      const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? []
      const outlineRules = rules.filter(rule => rule.includes('outline'))
      expect(outlineRules).toHaveLength(1)
      expect(outlineRules[0]).toContain('.macvue-field-input')
      expect(outlineRules[0]).toContain('outline: none')
    })

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })

    it('assigns the complete bridge set in every size modifier', () => {
      const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
      const sets = sizes.map((size) => {
        const block = css.match(
          new RegExp(`\\.macvue-field--${size} \\{([^}]*)\\}`),
        )?.[1]
        expect(block, `modifier for ${size} must exist`).toBeDefined()
        const bridges = [...block!.matchAll(/(--_macvue-[\w-]+):([^;]+);/g)]
        expect(bridges.length).toBeGreaterThan(0)
        // Every bridge must point at the per-size token of ITS size.
        for (const [, name, value] of bridges) {
          expect(value.trim(), `${name} in the ${size} modifier`).toBe(
            `var(${name.replace('--_macvue', '--macvue')}-${size})`,
          )
        }
        return bridges
          .map(([, name]) => name)
          .sort()
          .join()
      })
      // All five modifiers must assign the same set of bridges.
      expect(new Set(sets).size).toBe(1)
    })
  })
})
