// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacSeparator } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

describe('macSeparator', () => {
  it('renders a horizontal separator with the separator role by default', () => {
    const { getByRole } = render(MacSeparator)
    const separator = getByRole('separator')
    expect(separator.getAttribute('data-orientation')).toBe('horizontal')
  })

  it('supports the vertical orientation with aria-orientation', () => {
    const { getByRole } = render(MacSeparator, {
      props: { orientation: 'vertical' },
    })
    const separator = getByRole('separator')
    expect(separator.getAttribute('data-orientation')).toBe('vertical')
    expect(separator.getAttribute('aria-orientation')).toBe('vertical')
  })

  it('hides decorative separators from assistive technology', () => {
    const { container, queryByRole } = render(MacSeparator, {
      props: { decorative: true },
    })
    expect(queryByRole('separator')).toBeNull()
    expect(container.querySelector('.macvue-separator')).toBeTruthy()
  })

  it('has no axe violations', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacSeparator),
          h(MacSeparator, { orientation: 'vertical' }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('separator.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/separator/separator.css'),
        'utf8',
      )
    })

    it('is static: no hover, transition or focus styles', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
      expect(css).not.toContain(':focus')
    })

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })
  })
})
