// @vitest-environment jsdom
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacHelpButton } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

describe('macHelpButton', () => {
  it('renders a circular button labelled Help with a hidden glyph', () => {
    const { getByRole } = render(MacHelpButton)
    const button = getByRole('button') as HTMLButtonElement
    expect(button.getAttribute('aria-label')).toBe('Help')
    expect(button.type).toBe('button')
    expect(button.querySelector('[aria-hidden="true"]')?.textContent).toBe('?')
  })

  it('supports a custom label', () => {
    const { getByRole } = render(MacHelpButton, {
      props: { label: 'Hilfe' },
    })
    expect(getByRole('button').getAttribute('aria-label')).toBe('Hilfe')
  })

  it('renders a modifier class for every control size', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = render(MacHelpButton, {
        props: { size },
      })
      expect(
        getByRole('button').classList.contains(`macvue-help-button--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('disables and suppresses clicks', async () => {
    const onClick = vi.fn()
    const { getByRole } = render(MacHelpButton, {
      props: { disabled: true },
      attrs: { onClick },
    })
    const button = getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
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
        const help = ref<Exposed>()
        onMounted(() => {
          exposed = help.value
        })
        return () => h(MacHelpButton, { ref: help })
      },
    })
    await nextTick()
    const button = getByRole('button')
    expect(exposed!.el).toBe(button)
    exposed!.focus()
    expect(document.activeElement).toBe(button)
    exposed!.blur()
    expect(document.activeElement).not.toBe(button)
  })

  it('has no axe violations', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(MacHelpButton),
          h(MacHelpButton, { disabled: true }),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('help-button.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(
          import.meta.dirname,
          '../src/components/help-button/help-button.css',
        ),
        'utf8',
      )
    })

    it('has no :hover and no transition (macOS buttons have neither)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
    })

    it('keeps the macOS arrow cursor and non-selectable glyph', () => {
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
