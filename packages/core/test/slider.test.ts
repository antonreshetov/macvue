// @vitest-environment jsdom
import type { MacSliderProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacSlider } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

// Reka's SliderThumb measures itself via ResizeObserver, which jsdom lacks.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver
  ??= ResizeObserverStub as unknown as typeof ResizeObserver

async function renderSlider(
  props: MacSliderProps & Record<string, unknown> = {},
) {
  const merged: MacSliderProps & Record<string, unknown> = {
    'aria-label': 'Volume',
    ...props,
  }
  const utils = render(MacSlider, { props: merged })
  // Reka positions/reveals the thumb in a post-mount effect.
  await nextTick()
  return utils
}

describe('macSlider', () => {
  it('renders a slider thumb with the aria label and horizontal orientation', async () => {
    const { getByRole, container } = await renderSlider()
    const thumb = getByRole('slider')
    expect(thumb.getAttribute('aria-label')).toBe('Volume')
    expect(
      container
        .querySelector('.macvue-slider')
        ?.getAttribute('data-orientation'),
    ).toBe('horizontal')
  })

  it('renders an inert glass lens with a unique SSR-safe filter id', async () => {
    const { container, getAllByRole } = render({
      render() {
        return h('div', [
          h(MacSlider, { 'aria-label': 'First' }),
          h(MacSlider, { 'aria-label': 'Second' }),
        ])
      },
    })
    await nextTick()
    const firstLens = container.querySelector('.macvue-slider-glass-lens')
    const filters = Array.from(
      container.querySelectorAll('.macvue-slider-glass-filter filter'),
    )

    expect(firstLens?.getAttribute('aria-hidden')).toBe('true')
    expect(filters.every(filter => filter?.id)).toBe(true)
    expect(new Set(filters.map(filter => filter.id)).size).toBe(2)
    expect(getAllByRole('slider')[0]?.contains(firstLens)).toBe(true)
    expect(filters[0]?.getAttribute('color-interpolation-filters')).toBe(
      'sRGB',
    )
    expect(
      Array.from(filters[0]!.children, child => child.localName),
    ).toEqual([
      'feGaussianBlur',
      'feImage',
      'feDisplacementMap',
      'feColorMatrix',
      'feImage',
      'feComposite',
      'feColorMatrix',
      'feColorMatrix',
      'feBlend',
      'feBlend',
    ])
    for (const image of Array.from(filters[0]!.querySelectorAll('feImage'))) {
      expect(image.hasAttribute('x')).toBe(true)
      expect(image.hasAttribute('y')).toBe(true)
      expect(image.hasAttribute('width')).toBe(true)
      expect(image.hasAttribute('height')).toBe(true)
    }
  })

  it('emits a plain number on keyboard interaction', async () => {
    const user = userEvent.setup()
    const { getByRole, emitted } = await renderSlider({ modelValue: 50 })
    await user.tab()
    expect(document.activeElement).toBe(getByRole('slider'))
    await user.keyboard('{ArrowRight}')
    expect(emitted('update:modelValue')).toEqual([[51]])
  })

  it('supports uncontrolled usage through defaultValue', async () => {
    const user = userEvent.setup()
    const { getByRole } = await renderSlider({ defaultValue: 10 })
    const thumb = getByRole('slider')
    expect(thumb.getAttribute('aria-valuenow')).toBe('10')
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(thumb.getAttribute('aria-valuenow')).toBe('11')
  })

  it('follows the controlled value', async () => {
    const { getByRole, rerender } = await renderSlider({ modelValue: 20 })
    expect(getByRole('slider').getAttribute('aria-valuenow')).toBe('20')
    await rerender({ 'aria-label': 'Volume', 'modelValue': 80 })
    expect(getByRole('slider').getAttribute('aria-valuenow')).toBe('80')
  })

  it('forwards the commit event with a plain number', async () => {
    const user = userEvent.setup()
    const { emitted } = await renderSlider({ modelValue: 50 })
    await user.tab()
    await user.keyboard('{ArrowRight}')
    const commits = emitted('valueCommit')
    expect(commits).toBeDefined()
    expect(commits!.at(-1)).toEqual([51])
  })

  it('renders the requested number of ticks', async () => {
    const { container } = await renderSlider({ ticks: 5 })
    expect(container.querySelectorAll('.macvue-slider-tick')).toHaveLength(5)
    expect(
      container
        .querySelector('.macvue-slider-ticks')
        ?.getAttribute('aria-hidden'),
    ).toBe('true')
  })

  it('derives the step from the tick count with snapToTicks', async () => {
    const user = userEvent.setup()
    const { getByRole, emitted } = await renderSlider({
      modelValue: 0,
      ticks: 5,
      snapToTicks: true,
    })
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(emitted('update:modelValue')).toEqual([[25]])
    expect(getByRole('slider').getAttribute('aria-valuemax')).toBe('100')
  })

  it('renders vertically when asked', async () => {
    const { container } = await renderSlider({ orientation: 'vertical' })
    expect(
      container
        .querySelector('.macvue-slider')
        ?.getAttribute('data-orientation'),
    ).toBe('vertical')
  })

  it('submits a flat scalar name through native form data', async () => {
    const { container } = render({
      render() {
        return h('form', [
          h(MacSlider, {
            'aria-label': 'Volume',
            'modelValue': 50,
            'name': 'volume',
          }),
        ])
      },
    })
    await nextTick()
    const data = new FormData(container.querySelector('form')!)
    expect(data.get('volume')).toBe('50')
    expect(data.get('volume[0]')).toBeNull()
  })

  it('renders a modifier class for every control size', async () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { container, unmount } = await renderSlider({ size })
      expect(
        container
          .querySelector('.macvue-slider')
          ?.classList
          .contains(`macvue-slider--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('splits attrs: class/style go to the root, aria attrs to the thumb', async () => {
    const { getByRole, container } = await renderSlider({
      class: 'custom',
      style: 'margin-top: 4px',
    })
    const root = container.querySelector('.macvue-slider') as HTMLElement
    expect(root.classList.contains('custom')).toBe(true)
    expect(root.style.marginTop).toBe('4px')
    expect(getByRole('slider').getAttribute('aria-label')).toBe('Volume')
  })

  it('marks the control disabled and ignores keyboard input', async () => {
    const user = userEvent.setup()
    const { container, emitted } = await renderSlider({
      modelValue: 50,
      disabled: true,
    })
    expect(
      container.querySelector('.macvue-slider')?.hasAttribute('data-disabled'),
    ).toBe(true)
    await user.tab()
    await user.keyboard('{ArrowRight}')
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('exposes focus(), blur() and el pointing at the thumb', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLElement | null
    }
    let exposed: Exposed | undefined
    const { getByRole } = render({
      setup() {
        const slider = ref<Exposed>()
        onMounted(() => {
          exposed = slider.value
        })
        return () => h(MacSlider, { 'ref': slider, 'aria-label': 'Volume' })
      },
    })
    await nextTick()
    const thumb = getByRole('slider')
    expect(exposed!.el).toBe(thumb)
    exposed!.focus()
    expect(document.activeElement).toBe(thumb)
    exposed!.blur()
    expect(document.activeElement).not.toBe(thumb)
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacSlider, { 'aria-label': 'Plain', 'modelValue': 30 }),
          h(MacSlider, { 'aria-label': 'Ticked', 'modelValue': 50, 'ticks': 5 }),
          h(MacSlider, {
            'aria-label': 'Disabled',
            'modelValue': 70,
            'disabled': true,
          }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('slider.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/slider/slider.css'),
        'utf8',
      )
    })

    it('has no :hover and limits transitions to glass opacity/transform', async () => {
      expect(css).not.toContain(':hover')
      const transitionValues = css
        .split('transition:')
        .slice(1)
        .map(value => value.split(';', 1)[0])
      expect(transitionValues.length).toBeGreaterThan(0)
      for (const value of transitionValues) {
        expect(value).not.toMatch(
          /backdrop-filter|filter|background|box-shadow/,
        )
        expect(value).toMatch(/opacity|transform/)
      }
    })

    it('keeps the macOS arrow cursor and non-selectable control', async () => {
      expect(css).toContain('cursor: default')
      expect(css).toContain('user-select: none')
    })

    it('declares the focus ring only under :focus-visible', async () => {
      const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? []
      const outlineRules = rules.filter(rule => rule.includes('outline'))
      expect(outlineRules.length).toBeGreaterThan(0)
      expect(outlineRules.length).toBe(css.split('outline').length - 1)
      for (const rule of outlineRules) {
        expect(rule.slice(0, rule.indexOf('{'))).toContain(':focus-visible')
      }
      expect(css).not.toMatch(/:focus(?!-visible)/)
    })

    it('uses only tokens: no hex colors, no raw px values', async () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })

    it('assigns the complete bridge set in every size modifier', async () => {
      const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
      const sets = sizes.map((size) => {
        const block = css.match(
          new RegExp(`\\.macvue-slider--${size} \\{([^}]*)\\}`),
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
