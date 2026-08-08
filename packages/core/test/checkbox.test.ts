// @vitest-environment jsdom
import type { MacCheckboxProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacCheckbox } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderCheckbox(
  props: MacCheckboxProps & Record<string, unknown> = {},
  slot = 'Enable option',
) {
  return render(MacCheckbox, { props, slots: { default: () => slot } })
}

describe('macCheckbox', () => {
  it('renders a checkbox button with its caption', () => {
    const { getByRole } = renderCheckbox()
    const checkbox = getByRole('checkbox')
    expect(checkbox.tagName).toBe('BUTTON')
    expect(checkbox).toHaveProperty('type', 'button')
    expect(checkbox.closest('label')?.textContent).toContain('Enable option')
  })

  it('toggles uncontrolled state from defaultValue on click', async () => {
    const { getByRole } = renderCheckbox({ defaultValue: true })
    const checkbox = getByRole('checkbox')
    expect(checkbox.getAttribute('data-state')).toBe('checked')
    await userEvent.click(checkbox)
    expect(checkbox.getAttribute('data-state')).toBe('unchecked')
  })

  it('supports v-model (controlled)', async () => {
    const { getByRole, rerender, emitted } = renderCheckbox({
      modelValue: false,
    })
    const checkbox = getByRole('checkbox')
    expect(checkbox.getAttribute('data-state')).toBe('unchecked')

    await userEvent.click(checkbox)
    expect(emitted('update:modelValue')[0]).toEqual([true])

    await rerender({ modelValue: true })
    expect(checkbox.getAttribute('data-state')).toBe('checked')
  })

  it('clicking the caption toggles the control', async () => {
    const { getByText, getByRole } = renderCheckbox()
    await userEvent.click(getByText('Enable option'))
    expect(getByRole('checkbox').getAttribute('data-state')).toBe('checked')
  })

  it('renders the indeterminate state with aria-checked="mixed"', async () => {
    const { getByRole } = renderCheckbox({ modelValue: 'indeterminate' })
    const checkbox = getByRole('checkbox')
    expect(checkbox.getAttribute('data-state')).toBe('indeterminate')
    expect(checkbox.getAttribute('aria-checked')).toBe('mixed')
  })

  it('resolves indeterminate to checked on click', async () => {
    const { getByRole, emitted } = renderCheckbox({
      modelValue: 'indeterminate',
    })
    await userEvent.click(getByRole('checkbox'))
    expect(emitted('update:modelValue')[0]).toEqual([true])
  })

  it('disables the control and suppresses toggling', async () => {
    const { getByRole, getByText, emitted } = renderCheckbox({
      disabled: true,
    })
    const checkbox = getByRole('checkbox') as HTMLButtonElement
    expect(checkbox.disabled).toBe(true)
    await userEvent.click(getByText('Enable option'))
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('participates in a native form through name/value via a hidden input', async () => {
    const { container } = render({
      render() {
        return h('form', [
          h(
            MacCheckbox,
            { name: 'options', value: 'a', modelValue: true },
            () => 'Option A',
          ),
        ])
      },
    })
    await nextTick()
    const input = container.querySelector<HTMLInputElement>(
      'input[name="options"]',
    )
    expect(input).toBeTruthy()
    expect(input!.value).toBe('a')
    expect(input!.checked).toBe(true)
  })

  it('forwards aria-label and listeners to the control, not the label', async () => {
    const onFocus = vi.fn()
    const { getByRole } = render(MacCheckbox, {
      attrs: { 'aria-label': 'Enable option', onFocus },
    })
    const checkbox = getByRole('checkbox', { name: 'Enable option' })
    expect(checkbox.getAttribute('aria-label')).toBe('Enable option')
    expect(checkbox.closest('label')!.hasAttribute('aria-label')).toBe(false)

    checkbox.focus()
    expect(onFocus).toHaveBeenCalled()
  })

  it('merges a user class onto the root label', () => {
    const { getByRole } = renderCheckbox({ class: 'custom' })
    const label = getByRole('checkbox').closest('label')!
    expect(label.classList.contains('custom')).toBe(true)
    expect(label.classList.contains('macvue-checkbox')).toBe(true)
  })

  it('exposes focus(), blur() and el', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLButtonElement | null
    }
    let exposed: Exposed | undefined
    const { getByRole } = render({
      setup() {
        const checkbox = ref<Exposed>()
        onMounted(() => {
          exposed = checkbox.value
        })
        return () => h(MacCheckbox, { ref: checkbox }, () => 'Hi')
      },
    })
    await nextTick()
    const checkbox = getByRole('checkbox')

    expect(exposed!.el).toBeInstanceOf(HTMLButtonElement)
    expect(exposed!.el).toBe(checkbox)

    exposed!.focus()
    expect(document.activeElement).toBe(checkbox)

    exposed!.blur()
    expect(document.activeElement).not.toBe(checkbox)
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacCheckbox, {}, () => 'Unchecked'),
          h(MacCheckbox, { modelValue: true }, () => 'Checked'),
          h(MacCheckbox, { modelValue: 'indeterminate' }, () => 'Mixed'),
          h(MacCheckbox, { disabled: true }, () => 'Disabled'),
          h(
            MacCheckbox,
            { modelValue: true, disabled: true },
            () => 'Checked disabled',
          ),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('checkbox.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/checkbox/checkbox.css'),
        'utf8',
      )
    })

    it('has no :hover and no transition (macOS checkboxes have neither)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
    })

    it('keeps the macOS arrow cursor and non-selectable caption', () => {
      expect(css).toContain('cursor: default')
      expect(css).toContain('user-select: none')
    })

    it('declares the focus ring only under :focus-visible', () => {
      const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? []
      const outlineRules = rules.filter(rule => rule.includes('outline'))
      expect(outlineRules.length).toBeGreaterThan(0)
      expect(outlineRules.length).toBe(css.split('outline').length - 1)
      for (const rule of outlineRules) {
        expect(rule.slice(0, rule.indexOf('{'))).toContain(':focus-visible')
      }
      expect(css).not.toMatch(/:focus(?!-visible)/)
    })

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })
  })
})
