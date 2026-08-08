// @vitest-environment jsdom
import type { MacProgressProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacProgress } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderProgress(
  props: MacProgressProps & Record<string, unknown> = {},
) {
  const merged: MacProgressProps & Record<string, unknown> = {
    'aria-label': 'Progress',
    ...props,
  }
  return render(MacProgress, { props: merged })
}

describe('macProgress', () => {
  it('renders a determinate progressbar with aria values', () => {
    const { getByRole, container } = renderProgress({ value: 40 })
    const bar = getByRole('progressbar')
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(bar.getAttribute('aria-valuemax')).toBe('100')
    const fill = container.querySelector(
      '.macvue-progress-fill',
    ) as HTMLElement
    expect(fill.style.width).toBe('40%')
    expect(container.querySelector('.macvue-progress-comet')).toBeNull()
  })

  it('renders indeterminate without aria-valuenow and with the comet', () => {
    const { getByRole, container } = renderProgress()
    const bar = getByRole('progressbar')
    expect(bar.hasAttribute('aria-valuenow')).toBe(false)
    expect(bar.getAttribute('data-state')).toBe('indeterminate')
    expect(container.querySelector('.macvue-progress-comet')).toBeTruthy()
    expect(container.querySelector('.macvue-progress-fill')).toBeNull()
  })

  it('switches between determinate and indeterminate in both directions', async () => {
    const { container, rerender } = renderProgress({ value: 40 })
    await rerender({ 'aria-label': 'Progress', 'value': null })
    expect(container.querySelector('.macvue-progress-comet')).toBeTruthy()
    await rerender({ 'aria-label': 'Progress', 'value': 80 })
    const fill = container.querySelector(
      '.macvue-progress-fill',
    ) as HTMLElement
    expect(fill.style.width).toBe('80%')
  })

  it('respects max and clamps overshoot in style AND aria', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { getByRole, container } = renderProgress({ value: 30, max: 40 })
    expect(getByRole('progressbar').getAttribute('aria-valuemax')).toBe('40')
    expect(
      (container.querySelector('.macvue-progress-fill') as HTMLElement).style
        .width,
    ).toBe('75%')

    const over = renderProgress({ value: 50, max: 40 })
    const bar = over.container.querySelector(
      '[role="progressbar"]',
    ) as HTMLElement
    // Clamped before Reka: aria-valuenow never exceeds aria-valuemax.
    expect(bar.getAttribute('aria-valuenow')).toBe('40')
    expect(
      (over.container.querySelector('.macvue-progress-fill') as HTMLElement)
        .style.width,
    ).toBe('100%')
    // Pre-clamped bindings keep Reka's validation silent.
    expect(errorSpy).not.toHaveBeenCalled()
    errorSpy.mockRestore()
  })

  it('labels itself by default so an indeterminate bar passes axe alone', async () => {
    const { getByRole, container } = render(MacProgress)
    expect(getByRole('progressbar').getAttribute('aria-label')).toBe(
      'Progress',
    )
    expect(await axe(container)).toHaveNoViolations()
  })

  it('renders both bar sizes', () => {
    for (const size of ['regular', 'small'] as const) {
      const { container, unmount } = renderProgress({ size })
      expect(
        container
          .querySelector('.macvue-progress')
          ?.classList
          .contains(`macvue-progress--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacProgress, { 'aria-label': 'Copying', 'value': 40 }),
          h(MacProgress, { 'aria-label': 'Preparing' }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('progress.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/progress/progress.css'),
        'utf8',
      )
    })

    it('has no :hover and no focus styles (display-only control)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain(':focus')
    })

    it('animates the comet on its own duration token, never duration-fast', () => {
      const animations = css.match(/animation:[^;]+;/g) ?? []
      expect(animations.length).toBeGreaterThan(0)
      for (const animation of animations) {
        expect(animation).toContain(
          'var(--macvue-progress-indeterminate-duration)',
        )
        expect(animation).not.toContain('--macvue-duration-fast')
      }
    })

    it('replaces the comet with a static busy fill under reduced motion', () => {
      const reduced = css.match(
        /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*)/,
      )?.[1]
      expect(reduced).toBeDefined()
      expect(reduced).toContain('.macvue-progress-comet')
      expect(reduced).toContain('display: none')
      expect(reduced).toContain('var(--macvue-accent-disabled)')
    })

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })
  })
})
