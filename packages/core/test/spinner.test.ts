// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacSpinner } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

describe('macSpinner', () => {
  it('renders an indeterminate progressbar labelled Loading by default', () => {
    const { getByRole } = render(MacSpinner)
    const spinner = getByRole('progressbar')
    expect(spinner.getAttribute('aria-label')).toBe('Loading')
    expect(spinner.hasAttribute('aria-valuenow')).toBe(false)
  })

  it('supports a custom label', () => {
    const { getByRole } = render(MacSpinner, {
      props: { label: 'Preparing…' },
    })
    expect(getByRole('progressbar').getAttribute('aria-label')).toBe(
      'Preparing…',
    )
  })

  it('renders eight decorative blades with stepped opacities', () => {
    const { container } = render(MacSpinner)
    const blades = container.querySelectorAll('svg rect')
    expect(blades).toHaveLength(8)
    expect(blades[0].getAttribute('opacity')).toBe('0.55')
    expect(blades[7].getAttribute('opacity')).toBe('0.06')
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe(
      'true',
    )
  })

  it('renders both sizes', () => {
    for (const size of ['regular', 'small'] as const) {
      const { container, unmount } = render(MacSpinner, { props: { size } })
      expect(
        container
          .querySelector('.macvue-spinner')
          ?.classList
          .contains(`macvue-spinner--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('has no axe violations', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacSpinner),
          h(MacSpinner, { size: 'small', label: 'Working' }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('spinner.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/spinner/spinner.css'),
        'utf8',
      )
    })

    it('rotates in eight discrete steps on its own duration token', () => {
      expect(css).toContain('steps(8)')
      expect(css).toContain('var(--macvue-spinner-duration)')
      expect(css).not.toContain('--macvue-duration-fast')
    })

    it('keeps spinning under reduced motion (essential motion)', () => {
      // No reduced-motion override in this file, and the duration token is
      // outside the global zeroing — the spinner keeps stepping.
      expect(css).not.toContain('prefers-reduced-motion')
    })

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })
  })
})
