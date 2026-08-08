// @vitest-environment jsdom
import type { MacSwitchProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacSwitch } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderSwitch(
  props: MacSwitchProps & Record<string, unknown> = {},
  slot = 'Wi-Fi',
) {
  return render(MacSwitch, { props, slots: { default: () => slot } })
}

describe('macSwitch', () => {
  it('renders a switch button with the caption before the toggle', () => {
    const { getByRole, getByText } = renderSwitch()
    const control = getByRole('switch')
    expect(control.tagName).toBe('BUTTON')
    const label = getByText('Wi-Fi')
    // System Settings layout: caption on the left of the toggle.
    expect(
      label.compareDocumentPosition(control) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy()
  })

  it('renders a modifier class for every control size and keeps size off the control', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = renderSwitch({ size })
      const label = getByRole('switch').closest('label')
      expect(label?.classList.contains(`macvue-switch--${size}`)).toBe(true)
      // size is presentation-only and must not leak as an attribute.
      expect(getByRole('switch').hasAttribute('size')).toBe(false)
      unmount()
    }
  })

  it('toggles uncontrolled state from defaultValue and updates aria-checked', async () => {
    const { getByRole } = renderSwitch({ defaultValue: true })
    const control = getByRole('switch')
    expect(control.getAttribute('aria-checked')).toBe('true')
    expect(control.getAttribute('data-state')).toBe('checked')

    await userEvent.click(control)
    expect(control.getAttribute('aria-checked')).toBe('false')
    expect(control.getAttribute('data-state')).toBe('unchecked')
  })

  it('supports v-model (controlled)', async () => {
    const { getByRole, rerender, emitted } = renderSwitch({
      modelValue: false,
    })
    const control = getByRole('switch')
    expect(control.getAttribute('data-state')).toBe('unchecked')

    await userEvent.click(control)
    expect(emitted('update:modelValue')[0]).toEqual([true])

    await rerender({ modelValue: true })
    expect(control.getAttribute('data-state')).toBe('checked')
  })

  it('clicking the caption toggles the control', async () => {
    const { getByText, getByRole } = renderSwitch()
    await userEvent.click(getByText('Wi-Fi'))
    expect(getByRole('switch').getAttribute('data-state')).toBe('checked')
  })

  it('disables the control and suppresses toggling', async () => {
    const { getByRole, getByText, emitted } = renderSwitch({ disabled: true })
    const control = getByRole('switch') as HTMLButtonElement
    expect(control.disabled).toBe(true)
    await userEvent.click(getByText('Wi-Fi'))
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('participates in a native form through name/value via a hidden input', async () => {
    const { container } = render({
      render() {
        return h('form', [
          h(
            MacSwitch,
            { name: 'wifi', value: 'enabled', modelValue: true },
            () => 'Wi-Fi',
          ),
        ])
      },
    })
    await nextTick()
    const input
      = container.querySelector<HTMLInputElement>('input[name="wifi"]')
    expect(input).toBeTruthy()
    expect(input!.value).toBe('enabled')
    expect(input!.checked).toBe(true)
  })

  it('forwards aria-label and listeners to the control, not the label', async () => {
    const onFocus = vi.fn()
    const { getByRole } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi', onFocus },
    })
    const control = getByRole('switch', { name: 'Wi-Fi' })
    expect(control.getAttribute('aria-label')).toBe('Wi-Fi')
    expect(control.closest('label')!.hasAttribute('aria-label')).toBe(false)

    control.focus()
    expect(onFocus).toHaveBeenCalled()
  })

  it('merges a user class onto the root label', () => {
    const { getByRole } = renderSwitch({ class: 'custom' })
    const label = getByRole('switch').closest('label')!
    expect(label.classList.contains('custom')).toBe(true)
    expect(label.classList.contains('macvue-switch')).toBe(true)
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
        const control = ref<Exposed>()
        onMounted(() => {
          exposed = control.value
        })
        return () => h(MacSwitch, { ref: control }, () => 'Hi')
      },
    })
    await nextTick()
    const control = getByRole('switch')

    expect(exposed!.el).toBeInstanceOf(HTMLButtonElement)
    expect(exposed!.el).toBe(control)

    exposed!.focus()
    expect(document.activeElement).toBe(control)

    exposed!.blur()
    expect(document.activeElement).not.toBe(control)
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacSwitch, {}, () => 'Off'),
          h(MacSwitch, { modelValue: true }, () => 'On'),
          h(MacSwitch, { disabled: true }, () => 'Disabled'),
          h(
            MacSwitch,
            { modelValue: true, disabled: true },
            () => 'On disabled',
          ),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('switch.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/switch/switch.css'),
        'utf8',
      )
    })

    it('has no :hover styles', () => {
      expect(css).not.toContain(':hover')
    })

    it('allows transitions only for transform/background-color/box-shadow driven by the motion tokens', () => {
      const transitions = css.match(/transition:[^;]+;/g) ?? []
      expect(transitions.length).toBeGreaterThan(0)
      const entry
        = /(?:transform|background-color|box-shadow) var\(--macvue-duration-[\w-]+\) var\(--macvue-easing-[\w-]+\)/
      for (const transition of transitions) {
        expect(transition.replaceAll(/\s+/g, ' ')).toMatch(
          new RegExp(`^transition: ${entry.source}(?:, ${entry.source})*;$`),
        )
      }
    })

    it('doubles the disabled-on fill so the row dim lands on the kit value', () => {
      expect(css).toContain('[data-state=\'checked\'][data-disabled]')
      expect(css).toContain('var(--macvue-switch-track-on-disabled)')
    })

    it('has no keyframe animations', () => {
      expect(css).not.toMatch(/animation|@keyframes/)
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
