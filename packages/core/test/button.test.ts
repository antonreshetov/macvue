// @vitest-environment jsdom
import type { MacButtonProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
// Namespace import is required: the package's .d.ts is a type-only re-export,
// so named imports from 'vitest-axe/matchers' do not compile.
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { MacButton } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderButton(
  props: MacButtonProps & Record<string, unknown> = {},
  slot = 'Click me',
) {
  return render(MacButton, { props, slots: { default: () => slot } })
}

describe('macButton', () => {
  it('renders a button with type="button" and slot content', () => {
    const { getByRole } = renderButton()
    const button = getByRole('button')
    expect(button.tagName).toBe('BUTTON')
    expect(button).toHaveProperty('type', 'button')
    expect(button.textContent).toBe('Click me')
  })

  it('applies default classes', () => {
    const { getByRole } = renderButton()
    expect(getByRole('button').className).toBe(
      'macvue-button macvue-button--regular macvue-button--default',
    )
  })

  it('applies explicit size and variant classes', () => {
    const { getByRole } = renderButton({ size: 'small', variant: 'prominent' })
    const button = getByRole('button')
    expect(button.classList.contains('macvue-button--small')).toBe(true)
    expect(button.classList.contains('macvue-button--prominent')).toBe(true)
  })

  it('renders a modifier class for every control size', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = renderButton({ size })
      expect(
        getByRole('button').classList.contains(`macvue-button--${size}`),
      ).toBe(true)
      unmount()
    }
  })

  it('merges a user class with component classes', () => {
    const { getByRole } = renderButton({ class: 'custom' })
    const button = getByRole('button')
    expect(button.classList.contains('custom')).toBe(true)
    expect(button.classList.contains('macvue-button')).toBe(true)
  })

  it('lets a user type attribute win over the static one', () => {
    const { getByRole } = renderButton({ type: 'submit' })
    expect(getByRole('button').getAttribute('type')).toBe('submit')
  })

  it('sets the disabled attribute and suppresses clicks', async () => {
    const onClick = vi.fn()
    const { getByRole } = renderButton({ disabled: true, onClick })
    const button = getByRole('button') as HTMLButtonElement
    expect(button.disabled).toBe(true)
    await userEvent.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('is keyboard operable: Tab focuses, Enter and Space click', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    const { getByRole } = renderButton({ onClick })
    const button = getByRole('button')

    await user.tab()
    expect(document.activeElement).toBe(button)

    await user.keyboard('{Enter}')
    expect(onClick).toHaveBeenCalledTimes(1)

    await user.keyboard(' ')
    expect(onClick).toHaveBeenCalledTimes(2)
  })

  it('merges a user style with the component', () => {
    const { getByRole } = renderButton({ style: 'margin-top: 4px' })
    const button = getByRole('button') as HTMLButtonElement
    expect(button.style.marginTop).toBe('4px')
    expect(button.classList.contains('macvue-button')).toBe(true)
  })

  it('exposes focus(), blur() and el', async () => {
    // The exposed API is reached through a wrapper holding a template ref.
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLButtonElement | null
    }
    let exposed: Exposed | undefined
    const { getByRole } = render({
      setup() {
        const btn = ref<Exposed>()
        onMounted(() => {
          exposed = btn.value
        })
        return () => h(MacButton, { ref: btn }, () => 'Hi')
      },
    })
    await nextTick()
    const button = getByRole('button')

    expect(exposed!.el).toBeInstanceOf(HTMLButtonElement)
    expect(exposed!.el).toBe(button)

    exposed!.focus()
    expect(document.activeElement).toBe(button)

    exposed!.blur()
    expect(document.activeElement).not.toBe(button)
  })

  it('has no axe violations across variants and states', async () => {
    const variants = ['default', 'prominent', 'destructive'] as const
    const { container } = render({
      render() {
        return h(
          'div',
          variants.flatMap(variant => [
            h(MacButton, { variant }, () => `${variant} button`),
            h(
              MacButton,
              { variant, disabled: true },
              () => `${variant} disabled`,
            ),
          ]),
        )
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('button.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(import.meta.dirname, '../src/components/button/button.css'),
        'utf8',
      )
    })

    it('has no :hover and no transition (macOS buttons have neither)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
    })

    it('keeps the macOS arrow cursor and non-selectable label', () => {
      expect(css).toContain('cursor: default')
      expect(css).toContain('user-select: none')
    })

    it('declares the focus ring only under :focus-visible', () => {
      // Split by rules so an outline slipping into any selector fails,
      // not just one prefixed with .macvue-button.
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

    it('disables default and prominent with exact fills, not a blanket opacity', () => {
      const rules = css.match(/[^{}]+\{[^{}]*\}/g) ?? []
      // Comments (leading ones land in the selector text) would trip both
      // the selector match and the opacity check below.
      const stripComments = (text: string) =>
        text.replaceAll(/\/\*[\s\S]*?\*\//g, '')
      const disabledRule = (selector: string) =>
        rules
          .map(stripComments)
          .find(rule => rule.slice(0, rule.indexOf('{')).trim() === selector)

      const base = disabledRule('.macvue-button:disabled')
      expect(base).toBeDefined()
      expect(base).not.toContain('opacity')
      expect(base).toContain('var(--macvue-button-bg-disabled)')

      const prominent = disabledRule('.macvue-button--prominent:disabled')
      expect(prominent).toBeDefined()
      expect(prominent).not.toContain('opacity')
      expect(prominent).toContain('var(--macvue-button-bg-prominent-disabled)')
    })
  })
})
