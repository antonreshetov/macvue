// @vitest-environment jsdom
import type { MacSegmentedControlProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacSegment, MacSegmentedControl } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

async function renderControl(
  props: MacSegmentedControlProps & Record<string, unknown> = {},
  values: string[] = ['list', 'icons', 'columns'],
) {
  const merged: MacSegmentedControlProps & Record<string, unknown> = {
    'aria-label': 'View',
    ...props,
  }
  const utils = render(MacSegmentedControl, {
    props: merged,
    slots: {
      default: () =>
        values.map(value =>
          h(MacSegment, { value, disabled: undefined }, () => value),
        ),
    },
  })
  await nextTick()
  return utils
}

function segment(container: Element, label: string) {
  return Array.from(container.querySelectorAll('.macvue-segment')).find(
    element => element.textContent?.trim() === label,
  ) as HTMLButtonElement
}

describe('macSegmentedControl', () => {
  it('renders a group of toggle segments', async () => {
    const { container } = await renderControl()
    expect(container.querySelectorAll('.macvue-segment')).toHaveLength(3)
  })

  it('selects on click and emits the plain string', async () => {
    const { container, emitted } = await renderControl()
    await userEvent.click(segment(container, 'icons'))
    expect(emitted('update:modelValue')).toEqual([['icons']])
    expect(segment(container, 'icons').getAttribute('data-state')).toBe('on')
  })

  it('never deselects on a repeated click in single mode', async () => {
    const { container, emitted } = await renderControl({ modelValue: 'icons' })
    const selected = segment(container, 'icons')
    expect(selected.getAttribute('data-state')).toBe('on')

    await userEvent.click(selected)
    // Reka would emit undefined here; the wrapper swallows it.
    expect(emitted('update:modelValue')).toBeUndefined()
    expect(selected.getAttribute('data-state')).toBe('on')
  })

  it('selects from an empty start and still never deselects', async () => {
    // HIGH regression guard: an undefined start once detached the model
    // from Reka's internal proxy, breaking the deselect guard.
    const { container, emitted } = await renderControl()
    await userEvent.click(segment(container, 'icons'))
    expect(emitted('update:modelValue')).toEqual([['icons']])
    expect(segment(container, 'icons').getAttribute('data-state')).toBe('on')

    await userEvent.click(segment(container, 'icons'))
    expect(emitted('update:modelValue')).toEqual([['icons']])
    expect(segment(container, 'icons').getAttribute('data-state')).toBe('on')
    // The pill stays in sync with the selected segment.
    expect(container.querySelector('.macvue-segmented-pill')).toBeTruthy()
  })

  it('clears the selection when a controlled model resets to undefined', async () => {
    const { container, rerender } = await renderControl({
      modelValue: 'icons',
      name: 'view',
    })
    expect(segment(container, 'icons').getAttribute('data-state')).toBe('on')

    await rerender({
      'aria-label': 'View',
      'modelValue': undefined,
      'name': 'view',
    })
    for (const label of ['list', 'icons', 'columns'])
      expect(segment(container, label).getAttribute('data-state')).toBe('off')
    expect(container.querySelector('input[type="hidden"]')).toBeNull()
  })

  it('supports multiple selection with an array model', async () => {
    const { container, emitted } = await renderControl({
      type: 'multiple',
      defaultValue: ['list'],
    })
    await userEvent.click(segment(container, 'icons'))
    expect(emitted('update:modelValue')).toEqual([[['list', 'icons']]])

    // Deselection IS allowed in multiple mode.
    await userEvent.click(segment(container, 'list'))
    expect(emitted('update:modelValue')!.at(-1)).toEqual([['icons']])
  })

  it('supports uncontrolled usage through defaultValue', async () => {
    const { container } = await renderControl({ defaultValue: 'columns' })
    expect(segment(container, 'columns').getAttribute('data-state')).toBe('on')
    await userEvent.click(segment(container, 'list'))
    expect(segment(container, 'list').getAttribute('data-state')).toBe('on')
    expect(segment(container, 'columns').getAttribute('data-state')).toBe(
      'off',
    )
  })

  it('follows the controlled value', async () => {
    const { container, rerender } = await renderControl({ modelValue: 'list' })
    await rerender({ 'aria-label': 'View', 'modelValue': 'columns' })
    expect(segment(container, 'columns').getAttribute('data-state')).toBe('on')
    expect(segment(container, 'list').getAttribute('data-state')).toBe('off')
  })

  it('moves selection focus with arrows and selects with Space', async () => {
    const user = userEvent.setup()
    const { container } = await renderControl({ defaultValue: 'list' })
    await user.tab()
    expect(document.activeElement).toBe(segment(container, 'list'))

    await user.keyboard('{ArrowRight}')
    expect(document.activeElement).toBe(segment(container, 'icons'))

    await user.keyboard(' ')
    expect(segment(container, 'icons').getAttribute('data-state')).toBe('on')
  })

  it('renders the sliding pill for the selected segment in single mode', async () => {
    const { container } = await renderControl({ modelValue: 'icons' })
    expect(container.querySelector('.macvue-segmented-pill')).toBeTruthy()

    const { container: multiple } = await renderControl({
      type: 'multiple',
      modelValue: ['icons'],
    })
    expect(multiple.querySelector('.macvue-segmented-pill')).toBeNull()
  })

  it('disables the whole group or a single segment', async () => {
    const { container, emitted } = await renderControl({ disabled: true })
    await userEvent.click(segment(container, 'list'))
    expect(emitted('update:modelValue')).toBeUndefined()

    const singleProps: MacSegmentedControlProps & Record<string, unknown> = {
      'aria-label': 'View',
    }
    const single = render(MacSegmentedControl, {
      props: singleProps,
      slots: {
        default: () => [
          h(MacSegment, { value: 'a' }, () => 'a'),
          h(MacSegment, { value: 'b', disabled: true }, () => 'b'),
        ],
      },
    })
    await nextTick()
    expect(segment(single.container, 'b').disabled).toBe(true)
  })

  it('matches the disabled-pill selector against the real DOM structure', async () => {
    const { container } = await renderControl({
      modelValue: 'icons',
      disabled: true,
    })
    // A disabled group propagates :disabled to the buttons, so the CSS
    // rule keyed off the segment (not the never-present root
    // data-disabled) applies.
    expect(
      container.querySelector(
        '.macvue-segmented .macvue-segment[data-state=\'on\']:disabled',
      ),
    ).toBeTruthy()
  })

  it('renders a modifier class for every control size', async () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { container, unmount } = await renderControl({ size })
      expect(
        container
          .querySelector('.macvue-segmented')
          ?.classList
          .contains(`macvue-segmented--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('renders hidden inputs for the selection when name is set', async () => {
    const { container } = await renderControl({
      type: 'multiple',
      modelValue: ['list', 'icons'],
      name: 'view',
    })
    const inputs = Array.from(
      container.querySelectorAll<HTMLInputElement>('input[type="hidden"]'),
    ).filter(input => input.name === 'view')
    expect(inputs.map(input => input.value)).toEqual(['list', 'icons'])
  })

  it('exposes focus(), blur() and el', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLElement | null
    }
    let exposed: Exposed | undefined
    const { container } = render({
      setup() {
        const control = ref<Exposed>()
        onMounted(() => {
          exposed = control.value
        })
        return () =>
          h(
            MacSegmentedControl,
            { 'ref': control, 'aria-label': 'View', 'defaultValue': 'a' },
            () => [
              h(MacSegment, { value: 'a' }, () => 'a'),
              h(MacSegment, { value: 'b' }, () => 'b'),
            ],
          )
      },
    })
    await nextTick()
    expect(exposed!.el?.classList.contains('macvue-segmented')).toBe(true)
    exposed!.focus()
    expect(document.activeElement).toBe(segment(container, 'a'))
    exposed!.blur()
    expect(document.activeElement).not.toBe(segment(container, 'a'))
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(
            MacSegmentedControl,
            { 'aria-label': 'View', 'defaultValue': 'a' },
            () => [
              h(MacSegment, { value: 'a' }, () => 'List'),
              h(MacSegment, { value: 'b' }, () => 'Icons'),
            ],
          ),
          h(
            MacSegmentedControl,
            { 'aria-label': 'Disabled view', 'disabled': true },
            () => [
              h(MacSegment, { value: 'a' }, () => 'List'),
              h(MacSegment, { value: 'b' }, () => 'Icons'),
            ],
          ),
        ])
      },
    })
    await nextTick()
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('segmented.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(
          import.meta.dirname,
          '../src/components/segmented-control/segmented.css',
        ),
        'utf8',
      )
    })

    it('has no :hover (macOS segments have none)', () => {
      expect(css).not.toContain(':hover')
    })

    it('allows transitions only for the pill slide and separator fade on motion tokens', () => {
      const transitions = css.match(/transition:[^;]+;/g) ?? []
      expect(transitions.length).toBeGreaterThan(0)
      const entry
        = /(?:left|width|opacity) var\(--macvue-duration-[\w-]+\) var\(--macvue-easing-[\w-]+\)/
      for (const transition of transitions) {
        expect(transition.replaceAll(/\s+/g, ' ')).toMatch(
          new RegExp(`^transition: ${entry.source}(?:, ${entry.source})*;$`),
        )
      }
      expect(css).not.toMatch(/animation|@keyframes/)
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

    it('keys the disabled pill off the segment button, not the root', () => {
      expect(css).toContain(':has(.macvue-segment[data-state=\'on\']:disabled)')
      expect(css).not.toContain('[data-disabled]')
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
          new RegExp(`\\.macvue-segmented--${size} \\{([^}]*)\\}`),
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
