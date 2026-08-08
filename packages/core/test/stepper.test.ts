// @vitest-environment jsdom
import type { MacStepperProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { fireEvent, render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacStepper } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderStepper(props: MacStepperProps & Record<string, unknown> = {}) {
  const merged: MacStepperProps & Record<string, unknown> = {
    'aria-label': 'Copies',
    ...props,
  }
  return render(MacStepper, { props: merged })
}

function buttons(container: Element) {
  return {
    up: container.querySelector(
      '.macvue-stepper-button--up',
    ) as HTMLButtonElement,
    down: container.querySelector(
      '.macvue-stepper-button--down',
    ) as HTMLButtonElement,
  }
}

describe('macStepper', () => {
  it('renders a labelled spinbutton with value semantics on the root', () => {
    const { getByRole, container } = renderStepper({ modelValue: 3, max: 10 })
    const root = getByRole('spinbutton')
    expect(root.getAttribute('aria-valuenow')).toBe('3')
    expect(root.getAttribute('aria-valuemin')).toBe('0')
    expect(root.getAttribute('aria-valuemax')).toBe('10')
    expect(root.getAttribute('tabindex')).toBe('0')
    // The halves are pointer-only: hidden from AT and out of the tab order.
    const { up, down } = buttons(container)
    for (const button of [up, down]) {
      expect(button.getAttribute('tabindex')).toBe('-1')
      expect(button.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('steps up and down one step per click', async () => {
    const { container, emitted } = renderStepper({ modelValue: 5 })
    const { up, down } = buttons(container)
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: up },
      { keys: '[/MouseLeft]', target: up },
    ])
    expect(emitted('update:modelValue')).toEqual([[6]])
    await userEvent.pointer([
      { keys: '[MouseLeft>]', target: down },
      { keys: '[/MouseLeft]', target: down },
    ])
    expect(emitted('update:modelValue')).toEqual([[6], [4]])
  })

  it('clamps at the bounds without wraps', async () => {
    const { container, emitted } = renderStepper({
      defaultValue: 9,
      max: 10,
      step: 3,
    })
    const { up } = buttons(container)
    await fireEvent.pointerDown(up, { button: 0 })
    await fireEvent.pointerUp(up)
    expect(emitted('update:modelValue')).toEqual([[10]])
    await fireEvent.pointerDown(up, { button: 0 })
    await fireEvent.pointerUp(up)
    // Already at the bound — no further emit.
    expect(emitted('update:modelValue')).toEqual([[10]])
  })

  it('wraps across the bounds with wraps', async () => {
    const { container, emitted } = renderStepper({
      defaultValue: 10,
      max: 10,
      wraps: true,
    })
    const { up } = buttons(container)
    await fireEvent.pointerDown(up, { button: 0 })
    await fireEvent.pointerUp(up)
    expect(emitted('update:modelValue')).toEqual([[0]])
  })

  it('supports Up/Down/Home/End on the root', async () => {
    const user = userEvent.setup()
    const { getByRole, emitted } = renderStepper({ modelValue: 5, max: 20 })
    const root = getByRole('spinbutton')
    root.focus()
    await user.keyboard('{ArrowUp}')
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Home}')
    await user.keyboard('{End}')
    expect(emitted('update:modelValue')).toEqual([[6], [4], [0], [20]])
  })

  it('submits a flat scalar name through native form data', () => {
    const { container } = render({
      render() {
        return h('form', [
          h(MacStepper, {
            'aria-label': 'Copies',
            'modelValue': 7,
            'name': 'copies',
          }),
        ])
      },
    })
    const data = new FormData(container.querySelector('form')!)
    expect(data.get('copies')).toBe('7')
    expect(data.get('copies[0]')).toBeNull()
  })

  it('renders a hidden input when name is set', () => {
    const { container } = renderStepper({ modelValue: 7, name: 'copies' })
    const input = container.querySelector(
      'input[type="hidden"]',
    ) as HTMLInputElement
    expect(input.name).toBe('copies')
    expect(input.value).toBe('7')
  })

  it('renders a modifier class for every control size', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = renderStepper({ size })
      expect(
        getByRole('spinbutton').classList.contains(`macvue-stepper--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('disables both halves and leaves the tab order', async () => {
    const { getByRole, container, emitted } = renderStepper({
      modelValue: 5,
      disabled: true,
    })
    const root = getByRole('spinbutton')
    expect(root.hasAttribute('tabindex')).toBe(false)
    expect(root.getAttribute('aria-disabled')).toBe('true')
    const { up } = buttons(container)
    expect(up.disabled).toBe(true)
    await fireEvent.pointerDown(up, { button: 0 })
    await fireEvent.pointerUp(up)
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('does not focus a disabled stepper through the exposed focus()', async () => {
    interface Exposed {
      focus: () => void
    }
    let exposed: Exposed | undefined
    const { getByRole } = render({
      setup() {
        const stepper = ref<Exposed>()
        onMounted(() => {
          exposed = stepper.value
        })
        return () =>
          h(MacStepper, {
            'ref': stepper,
            'aria-label': 'Copies',
            'disabled': true,
          })
      },
    })
    await nextTick()
    exposed!.focus()
    expect(document.activeElement).not.toBe(getByRole('spinbutton'))
  })

  it('exposes focus(), blur() and el pointing at the spinbutton', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLDivElement | null
    }
    let exposed: Exposed | undefined
    const { getByRole } = render({
      setup() {
        const stepper = ref<Exposed>()
        onMounted(() => {
          exposed = stepper.value
        })
        return () => h(MacStepper, { 'ref': stepper, 'aria-label': 'Copies' })
      },
    })
    await nextTick()
    const root = getByRole('spinbutton')
    expect(exposed!.el).toBe(root)
    exposed!.focus()
    expect(document.activeElement).toBe(root)
    exposed!.blur()
    expect(document.activeElement).not.toBe(root)
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacStepper, { 'aria-label': 'Plain', 'modelValue': 3 }),
          h(MacStepper, {
            'aria-label': 'Disabled',
            'modelValue': 3,
            'disabled': true,
          }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('auto-repeat', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('fires once immediately, pauses, then repeats with acceleration', async () => {
      const { container, emitted } = renderStepper({ defaultValue: 0 })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      expect(emitted('update:modelValue')).toHaveLength(1)

      // Nothing more before the initial delay elapses.
      vi.advanceTimersByTime(499)
      expect(emitted('update:modelValue')).toHaveLength(1)

      // First repeat at the initial delay, second one interval later.
      vi.advanceTimersByTime(1)
      expect(emitted('update:modelValue')).toHaveLength(2)
      vi.advanceTimersByTime(100)
      expect(emitted('update:modelValue')).toHaveLength(3)

      // Acceleration: the next interval is shorter than the base one.
      vi.advanceTimersByTime(90)
      expect(emitted('update:modelValue')).toHaveLength(4)

      await fireEvent.pointerUp(up)
      vi.advanceTimersByTime(2000)
      expect(emitted('update:modelValue')).toHaveLength(4)
    })

    it('stops repeating at a bound when not wrapping', async () => {
      const { container, emitted } = renderStepper({
        defaultValue: 9,
        max: 10,
      })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      expect(emitted('update:modelValue')).toEqual([[10]])

      vi.advanceTimersByTime(5000)
      expect(emitted('update:modelValue')).toEqual([[10]])
    })

    it('keeps repeating across a bound when wrapping', async () => {
      const { container, emitted } = renderStepper({
        defaultValue: 9,
        max: 10,
        wraps: true,
      })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      vi.advanceTimersByTime(700)
      const values = (emitted('update:modelValue') as number[][]).map(
        ([value]) => value,
      )
      expect(values.slice(0, 3)).toEqual([10, 0, 1])
      await fireEvent.pointerUp(up)
    })

    it('cancels the repeat when the pointer leaves the button', async () => {
      const { container, emitted } = renderStepper({ defaultValue: 0 })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      await fireEvent.pointerLeave(up)
      vi.advanceTimersByTime(2000)
      expect(emitted('update:modelValue')).toHaveLength(1)
    })

    it('cancels the repeat on pointercancel', async () => {
      const { container, emitted } = renderStepper({ defaultValue: 0 })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      await fireEvent.pointerCancel(up)
      vi.advanceTimersByTime(2000)
      expect(emitted('update:modelValue')).toHaveLength(1)
    })

    it('cancels the repeat and removes the listener on window blur', async () => {
      const { container, emitted } = renderStepper({ defaultValue: 0 })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      window.dispatchEvent(new Event('blur'))
      vi.advanceTimersByTime(2000)
      expect(emitted('update:modelValue')).toHaveLength(1)

      // The blur listener is removed with the repeat: a later blur must
      // not interfere with a fresh press.
      await fireEvent.pointerUp(up)
      await fireEvent.pointerDown(up, { button: 0 })
      expect(emitted('update:modelValue')).toHaveLength(2)
      window.dispatchEvent(new Event('blur'))
      await fireEvent.pointerDown(up, { button: 0 })
      vi.advanceTimersByTime(500)
      expect((emitted('update:modelValue') ?? []).length).toBeGreaterThan(3)
    })

    it('stops a running repeat when the component unmounts mid-press', async () => {
      const { container, emitted, unmount } = renderStepper({
        defaultValue: 0,
      })
      const { up } = buttons(container)

      await fireEvent.pointerDown(up, { button: 0 })
      expect(emitted('update:modelValue')).toHaveLength(1)
      unmount()
      // onBeforeUnmount cancels the pending repeat timer.
      expect(vi.getTimerCount()).toBe(0)
    })
  })

  describe('stepper.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/stepper/stepper.css'),
        'utf8',
      )
    })

    it('has no :hover and no transition (macOS steppers have neither)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
    })

    it('keeps the macOS arrow cursor and non-selectable control', () => {
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

    it('assigns the complete bridge set in every size modifier', () => {
      const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
      const sets = sizes.map((size) => {
        const block = css.match(
          new RegExp(`\\.macvue-stepper--${size} \\{([^}]*)\\}`),
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
