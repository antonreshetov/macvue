// @vitest-environment jsdom
import type { MacGlassPanelProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'
import { h } from 'vue'
import { MacGlassPanel } from '../src'

declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

describe('macGlassPanel', () => {
  it('renders a plain div with regular material by default', () => {
    const { container } = render(MacGlassPanel, {
      slots: { default: () => 'Controls' },
    })
    const panel = container.querySelector('.macvue-glass-panel')

    expect(panel?.tagName).toBe('DIV')
    expect(panel?.classList.contains('macvue-glass-panel--regular')).toBe(true)
    expect(panel?.textContent).toContain('Controls')
    expect(panel?.hasAttribute('role')).toBe(false)
  })

  it('renders the clear material without regular material classes', () => {
    const { container } = render(MacGlassPanel, {
      props: { material: 'clear' },
    })
    const panel = container.querySelector('.macvue-glass-panel')

    expect(panel?.classList.contains('macvue-glass-panel--clear')).toBe(true)
    expect(panel?.classList.contains('macvue-glass-panel--regular')).toBe(
      false,
    )
  })

  it('falls through attrs to the root and does not alter interactive content', () => {
    const { container, getByRole } = render(MacGlassPanel, {
      props: {
        'class': 'custom-panel',
        'data-testid': 'panel',
      } as MacGlassPanelProps & Record<string, unknown>,
      slots: {
        default: () => h('button', { type: 'button' }, 'Play'),
      },
    })
    const panel = container.querySelector('.macvue-glass-panel')

    expect(panel?.classList.contains('custom-panel')).toBe(true)
    expect(panel?.getAttribute('data-testid')).toBe('panel')
    expect(getByRole('button').closest('.macvue-glass-panel')).toBe(panel)
  })

  it('keeps the internal optics decorative', () => {
    const { container } = render(MacGlassPanel)
    const lens = container.querySelector('.macvue-glass-panel-lens')
    const filter = container.querySelector('.macvue-glass-panel-filter')

    expect(lens?.getAttribute('aria-hidden')).toBe('true')
    expect(filter?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('[data-macvue-glass-ready]')).toBeNull()
  })

  it('has no axe violations', async () => {
    const { container } = render(MacGlassPanel, {
      slots: { default: () => h('button', { type: 'button' }, 'Play') },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('glass-panel.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(
          import.meta.dirname,
          '../src/components/glass-panel/glass-panel.css',
        ),
        'utf8',
      )
    })

    it('uses tokens only: no hex colors or raw px values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      expect(css.match(/[\d.]+px/g) ?? []).toHaveLength(0)
    })

    it('has explicit reduced-transparency and forced-colors fallbacks', () => {
      expect(css).toContain('@media (prefers-reduced-transparency: reduce)')
      expect(css).toContain('@media (forced-colors: active)')
      expect(css).toContain('--macvue-glass-panel-opaque-bg-regular')
      expect(css).toContain('--macvue-glass-panel-opaque-bg-clear')
      expect(css).toContain('background: Canvas')
    })

    it('keeps optics inert and does not animate filters', () => {
      expect(css).toContain('pointer-events: none')
      expect(css).not.toContain('transition')
      expect(css).not.toContain('@keyframes')
      expect(css).not.toContain(':hover')
    })

    it('activates SVG refraction only after runtime availability', () => {
      expect(css).toContain('.macvue-glass-panel[data-macvue-glass-ready]')
      expect(css).toContain('backdrop-filter: var(--_macvue-glass-filter)')
      expect(css).not.toContain('[data-macvue-glass=\'on\']')
    })
  })
})
