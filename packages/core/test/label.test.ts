// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacLabel } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

const variants = [
  'large-title',
  'title-1',
  'title-2',
  'title-3',
  'headline',
  'body',
  'callout',
  'subheadline',
  'footnote',
  'caption-1',
  'caption-2',
] as const

describe('macLabel', () => {
  it('renders a span with the body variant by default', () => {
    const { container } = render(MacLabel, {
      slots: { default: () => 'Text' },
    })
    const label = container.querySelector('.macvue-label') as HTMLElement
    expect(label.tagName).toBe('SPAN')
    expect(label.classList.contains('macvue-label--body')).toBe(true)
    expect(label.textContent).toBe('Text')
  })

  it('renders a modifier class for every text style', () => {
    for (const variant of variants) {
      const { container, unmount } = render(MacLabel, {
        props: { variant },
        slots: { default: () => variant },
      })
      expect(
        container
          .querySelector('.macvue-label')
          ?.classList
          .contains(`macvue-label--${variant}`),
      ).toBe(true)
      unmount()
    }
  })

  it('supports the secondary color and a custom tag', () => {
    const { container } = render(MacLabel, {
      props: { secondary: true, as: 'h2', variant: 'title-2' },
      slots: { default: () => 'Section' },
    })
    const label = container.querySelector('.macvue-label') as HTMLElement
    expect(label.tagName).toBe('H2')
    expect(label.classList.contains('macvue-label--secondary')).toBe(true)
  })

  it('has no axe violations', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacLabel, { variant: 'title-1', as: 'h1' }, () => 'Title'),
          h(MacLabel, { secondary: true }, () => 'Body text'),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('label.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/label/label.css'),
        'utf8',
      )
    })

    it('is static text: no hover, transition, cursor or focus styles', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
      expect(css).not.toContain(':focus')
    })

    it('covers every text-style variant with the semantic tokens', () => {
      for (const variant of variants) {
        expect(css).toContain(`.macvue-label--${variant}`)
        expect(css).toContain(`var(--macvue-text-${variant}-size)`)
        expect(css).toContain(`var(--macvue-text-${variant}-leading)`)
        expect(css).toContain(`var(--macvue-text-${variant}-weight)`)
      }
    })

    it('uses only tokens: no hex colors, no raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      const pxValues = css.match(/[\d.]+px/g) ?? []
      expect(pxValues).toHaveLength(0)
    })
  })
})
