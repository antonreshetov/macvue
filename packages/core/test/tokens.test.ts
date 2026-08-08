import { mkdtemp, readFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { buildTokens } from '../scripts/build-tokens.mjs'

async function buildInto(dir: string) {
  await buildTokens(dir)
  return {
    lightCss: await readFile(join(dir, 'styles/tokens.gen.css'), 'utf8'),
    darkCss: await readFile(join(dir, 'styles/tokens-dark.gen.css'), 'utf8'),
    tokenTs: await readFile(join(dir, 'tokens.gen.ts'), 'utf8'),
  }
}

let lightCss: string
let darkCss: string
let tokenTs: string

beforeAll(async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'macvue-tokens-'));
  ({ lightCss, darkCss, tokenTs } = await buildInto(outDir))
})

describe('tokens.gen.css', () => {
  it('wraps :root in the macvue.tokens layer with light appearance selector', () => {
    expect(lightCss).toContain('@layer macvue.tokens')
    expect(lightCss).toContain(':root')
    expect(lightCss).toContain('[data-macvue-appearance=\'light\']')
    expect(lightCss).toContain('color-scheme: light')
  })

  it('scopes color-scheme to the light appearance selector, not :root', () => {
    const rootBlock = lightCss.match(/:root \{([^}]*)\}/)?.[1]
    expect(rootBlock).toBeDefined()
    expect(rootBlock).not.toContain('color-scheme')

    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    expect(lightBlock).toContain('color-scheme: light')
  })

  it('emits reference tokens verbatim', () => {
    expect(lightCss.toLowerCase()).toContain('--macvue-ref-blue: #007aff')
  })

  it('emits semantic tokens as references to ref variables', () => {
    expect(lightCss).toMatch(/--macvue-[\w-]+: var\(--macvue-ref-[\w-]+\)/)
  })

  it('emits component tokens as references to semantic variables', () => {
    expect(lightCss).toContain('--macvue-button-bg: var(--macvue-control)')
    expect(lightCss).toContain(
      '--macvue-button-bg-prominent: var(--macvue-accent)',
    )
    expect(lightCss).toContain(
      '--macvue-button-bg-pressed: var(--macvue-control-pressed)',
    )
    expect(lightCss).toContain(
      '--macvue-button-font-size-regular: var(--macvue-control-text-size-regular)',
    )
  })

  it('emits ref-only component tokens as references to ref variables', () => {
    expect(lightCss).toContain(
      '--macvue-button-border-width: var(--macvue-ref-spacing-1)',
    )
  })

  it('re-declares themed tokens in the light island for use inside dark ancestors', () => {
    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    expect(lightBlock).toBeDefined()
    expect(lightBlock).toContain('--macvue-label: var(--macvue-ref-black-847)')
    expect(lightBlock).toContain('--macvue-accent: var(--macvue-ref-blue)')
    expect(lightBlock).toContain('--macvue-accent-hover:')
    expect(lightBlock).toContain('--macvue-accent-pressed:')
    expect(lightBlock).toContain('--macvue-focus-ring:')
    expect(lightBlock).toContain('--macvue-button-bg: var(--macvue-control)')
    expect(lightBlock).toContain('--macvue-button-label: var(--macvue-label)')
  })

  it('routes selection-bg through the accent variable', () => {
    expect(lightCss).toContain('--macvue-selection-bg: var(--macvue-accent)')
    expect(darkCss).toContain('--macvue-selection-bg: var(--macvue-accent)')
  })

  it('prefixes every variable with --macvue-', () => {
    const declarations = lightCss.match(/--[\w-]+(?=:)/g) ?? []
    expect(declarations.length).toBeGreaterThan(0)
    for (const name of declarations) expect(name).toMatch(/^--macvue-/)
  })

  it('does not emit semantic tokens under a "semantic" segment', () => {
    expect(lightCss).toContain('--macvue-label:')
    expect(lightCss).not.toContain('--macvue-semantic-')
  })
})

describe('tokens-dark.gen.css', () => {
  it('contains both explicit and auto appearance selectors', () => {
    expect(darkCss).toContain('[data-macvue-appearance=\'dark\']')
    expect(darkCss).toContain('@media (prefers-color-scheme: dark)')
    expect(darkCss).toContain('[data-macvue-appearance=\'auto\']')
    expect(darkCss).toContain('color-scheme: dark')
  })

  it('re-declares accent derivatives so scoped dark themes recompute them', () => {
    expect(darkCss).toContain('--macvue-accent-hover:')
    expect(darkCss).toContain('--macvue-accent-pressed:')
    expect(darkCss).toContain('--macvue-focus-ring:')
  })

  it('re-declares semantic-dependent component tokens so scoped dark themes recompute them', () => {
    expect(darkCss).toContain('--macvue-button-bg: var(--macvue-control)')
    expect(darkCss).toContain('--macvue-button-label: var(--macvue-label)')
    expect(darkCss).toContain(
      '--macvue-button-bg-prominent: var(--macvue-accent)',
    )
  })

  it('keeps ref definitions and ref-only component tokens out of overrides', () => {
    expect(darkCss).not.toMatch(/--macvue-ref-[\w-]+:/)
    expect(darkCss).not.toContain('--macvue-button-height-regular')
    expect(darkCss).not.toContain('--macvue-button-radius')
    expect(darkCss).not.toMatch(/--macvue-button-padding-x-[\w-]+:/)
    expect(darkCss).not.toContain('--macvue-button-border-width')
  })
})

describe('tokens.gen.ts', () => {
  it('exports the token name type and a non-empty name list', () => {
    expect(tokenTs).toContain('export type MacvueTokenName')
    expect(tokenTs).toContain('export const macvueTokenNames')
    expect(tokenTs).toMatch(/'--macvue-[\w-]+',/)
  })
})

describe('buildTokens', () => {
  it('is deterministic across runs', async () => {
    const first = await buildInto(
      await mkdtemp(join(tmpdir(), 'macvue-tokens-a-')),
    )
    const second = await buildInto(
      await mkdtemp(join(tmpdir(), 'macvue-tokens-b-')),
    )
    expect(second).toStrictEqual(first)
  })
})
