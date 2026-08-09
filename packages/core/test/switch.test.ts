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
  it('renders a two-position slider with the caption before the toggle', () => {
    const { getByRole, getByText } = renderSwitch()
    const control = getByRole('slider')
    expect(control).toBeInstanceOf(HTMLInputElement)
    expect((control as HTMLInputElement).type).toBe('range')
    expect((control as HTMLInputElement).min).toBe('0')
    expect((control as HTMLInputElement).max).toBe('1')
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
      const label = getByRole('slider').closest('label')
      expect(label?.classList.contains(`macvue-switch--${size}`)).toBe(true)
      // size is presentation-only and must not leak as an attribute.
      expect(getByRole('slider').hasAttribute('size')).toBe(false)
      unmount()
    }
  })

  it('toggles uncontrolled state and updates the slider value text', async () => {
    const { getByRole } = renderSwitch({ defaultValue: true })
    const control = getByRole('slider')
    expect(control.getAttribute('aria-valuetext')).toBe('On')
    expect(control.getAttribute('data-state')).toBe('checked')

    await userEvent.click(control)
    expect(control.getAttribute('aria-valuetext')).toBe('Off')
    expect(control.getAttribute('data-state')).toBe('unchecked')
  })

  it('supports v-model (controlled)', async () => {
    const { getByRole, rerender, emitted } = renderSwitch({
      modelValue: false,
    })
    const control = getByRole('slider')
    expect(control.getAttribute('data-state')).toBe('unchecked')

    await userEvent.click(control)
    expect(emitted('update:modelValue')[0]).toEqual([true])

    await rerender({ modelValue: true })
    expect(control.getAttribute('data-state')).toBe('checked')
  })

  it('toggles from the keyboard: Space and Enter', async () => {
    const user = userEvent.setup()
    const { getByRole, emitted } = renderSwitch()
    const control = getByRole('slider')
    control.focus()
    await user.keyboard(' ')
    expect(control.getAttribute('data-state')).toBe('checked')
    await user.keyboard('{Enter}')
    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('clears when a controlled model resets to undefined', async () => {
    const { getByRole, rerender } = renderSwitch({ modelValue: true })
    expect(getByRole('slider').getAttribute('data-state')).toBe('checked')
    await rerender({ modelValue: undefined })
    expect(getByRole('slider').getAttribute('data-state')).toBe('unchecked')
  })

  it('clicking the caption toggles the control', async () => {
    const { getByText, getByRole } = renderSwitch()
    await userEvent.click(getByText('Wi-Fi'))
    expect(getByRole('slider').getAttribute('data-state')).toBe('checked')
  })

  it('disables the control and suppresses toggling', async () => {
    const { getByRole, getByText, emitted } = renderSwitch({ disabled: true })
    const control = getByRole('slider') as HTMLInputElement
    expect(control.disabled).toBe(true)
    await userEvent.click(getByText('Wi-Fi'))
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('uses an a11y-hidden native checkbox for form semantics', async () => {
    const { container } = render({
      render() {
        return h('form', [
          h(
            MacSwitch,
            { name: 'wifi', value: 'enabled', modelValue: true },
            () => 'Wi-Fi',
          ),
          h(MacSwitch, { name: 'bt', modelValue: false }, () => 'Bluetooth'),
        ])
      },
    })
    await nextTick()
    const wifi
      = container.querySelector<HTMLInputElement>('input[name="wifi"]')!
    const bluetooth
      = container.querySelector<HTMLInputElement>('input[name="bt"]')!
    expect(wifi.type).toBe('checkbox')
    expect(wifi.checked).toBe(true)
    expect(bluetooth.checked).toBe(false)
    expect(wifi.tabIndex).toBe(-1)
    expect(wifi.getAttribute('aria-hidden')).toBe('true')
    const data = new FormData(container.querySelector('form')!)
    expect(data.get('wifi')).toBe('enabled')
    // The off switch contributes nothing.
    expect(data.get('bt')).toBeNull()
  })

  it('forwards aria-label and listeners to the control, not the label', async () => {
    const onFocus = vi.fn()
    const { getByRole } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi', onFocus },
    })
    const control = getByRole('slider', { name: 'Wi-Fi' })
    expect(control.getAttribute('aria-label')).toBe('Wi-Fi')
    expect(control.closest('label')!.hasAttribute('aria-label')).toBe(false)

    control.focus()
    expect(onFocus).toHaveBeenCalled()
  })

  it('merges a user class onto the root label', () => {
    const { getByRole } = renderSwitch({ class: 'custom' })
    const label = getByRole('slider').closest('label')!
    expect(label.classList.contains('custom')).toBe(true)
    expect(label.classList.contains('macvue-switch')).toBe(true)
  })

  it('exposes focus(), blur() and el', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLInputElement | null
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
    const control = getByRole('slider')

    expect(exposed!.el).toBeInstanceOf(HTMLInputElement)
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

  it('delegates drag movement to a native range without global listeners', async () => {
    const source = await readFile(
      join(import.meta.dirname, '../src/components/switch/MacSwitch.vue'),
      'utf8',
    )
    expect(source).toContain('type="range"')
    expect(source).toContain('@input="onInput"')
    expect(source).toContain('activePointerId')
    expect(source).not.toContain('setPointerCapture')
    expect(source).not.toContain('document.addEventListener')
    expect(source).not.toContain('Date.now')
    expect(source).not.toContain('setTimeout')
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
      // opacity is allowed for the press-lens fade (backdrop-filter is
      // not animatable — the glass appears through the layer's opacity).
      const entry
        = /(?:transform|background-color|box-shadow|opacity) var\(--macvue-duration-[\w-]+\) var\(--macvue-easing-[\w-]+\)/
      for (const transition of transitions) {
        expect(transition.replaceAll(/\s+/g, ' ')).toMatch(
          new RegExp(`^transition: ${entry.source}(?:, ${entry.source})*;$`),
        )
      }
    })

    it('shows a glass lens over the pressed knob', () => {
      // The lens is a separate ::after layer (backdrop-filter is not
      // animatable, so the glass fades in via opacity+scale) built from
      // the material-glass tokens; it activates under the label :active
      // (the caption is part of the hit-area) and never for disabled.
      expect(css).toContain('.macvue-switch-thumb::after')
      expect(css).toContain('backdrop-filter')
      expect(css).toContain('var(--macvue-material-glass-regular-bg)')
      expect(css).toContain('var(--macvue-material-glass-regular-blur)')
      expect(css).toContain('var(--macvue-material-glass-regular-saturation)')
      expect(css).toContain('var(--macvue-material-glass-regular-shadow)')
      // Comments mention the scale too — strip them before matching.
      const lensRules = (css.match(/[^{}]+\{[^{}]*\}/g) ?? [])
        .map(rule => rule.replaceAll(/\/\*[\s\S]*?\*\//g, ''))
        .filter(rule => rule.includes('scale(1.6)'))
      expect(lensRules).toHaveLength(1)
      const selector = lensRules[0].slice(0, lensRules[0].indexOf('{'))
      expect(selector).toContain('.macvue-switch:active')
      expect(selector).toContain(':not([data-disabled])')
      expect(selector).toContain('::after')
      // The enter runs on its own (zeroable) duration token.
      expect(css).toContain('var(--macvue-duration-switch-press)')
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

    it('assigns the complete bridge set in every size modifier', () => {
      const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
      const sets = sizes.map((size) => {
        const block = css.match(
          new RegExp(`\\.macvue-switch--${size} \\{([^}]*)\\}`),
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

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })
  })
})
