// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacBadge } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

describe('macBadge', () => {
  it('renders its slot content in a badge capsule', () => {
    const { container } = render(MacBadge, {
      slots: { default: () => '128' },
    })
    const badge = container.querySelector('.macvue-badge') as HTMLElement
    expect(badge.tagName).toBe('SPAN')
    expect(badge.textContent).toBe('128')
  })

  it('merges fallthrough class and style', () => {
    const { container } = render(MacBadge, {
      attrs: { class: 'custom', style: 'margin-left: 4px' },
      slots: { default: () => '3' },
    })
    const badge = container.querySelector('.macvue-badge') as HTMLElement
    expect(badge.classList.contains('custom')).toBe(true)
    expect(badge.style.marginLeft).toBe('4px')
  })

  it('has no axe violations', async () => {
    const { container } = render({
      render() {
        return h('div', [h(MacBadge, null, () => '12')])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('badge.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/badge/badge.css'),
        'utf8',
      )
    })

    it('is static: no hover, transition, cursor or focus styles', () => {
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
