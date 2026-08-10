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
    expect(lightCss.toLowerCase()).toContain('--macvue-ref-blue: #0088ff')
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
      '--macvue-button-padding-x-large: var(--macvue-ref-spacing-16)',
    )
  })

  it('re-declares themed tokens in the light island for use inside dark ancestors', () => {
    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    expect(lightBlock).toBeDefined()
    expect(lightBlock).toContain('--macvue-label: var(--macvue-ref-black-850)')
    expect(lightBlock).toContain('--macvue-accent: var(--macvue-ref-blue)')
    expect(lightBlock).toContain('--macvue-accent-hover:')
    expect(lightBlock).toContain('--macvue-accent-pressed:')
    expect(lightBlock).toContain('--macvue-focus-ring:')
    expect(lightBlock).toContain('--macvue-button-bg: var(--macvue-control)')
    expect(lightBlock).toContain('--macvue-button-label: var(--macvue-label)')
  })

  it('emits motion tokens as CSS variables', () => {
    expect(lightCss).toContain('--macvue-duration-fast: 150ms')
    expect(lightCss).toContain('--macvue-easing-default: ease-out')
  })

  it('re-declares the switch track pair in both theme islands', () => {
    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    const darkBlock = darkCss.match(
      /\[data-macvue-appearance='dark'\] \{([^}]*)\}/,
    )?.[1]
    for (const block of [lightBlock, darkBlock]) {
      expect(block).toBeDefined()
      expect(block).toContain('--macvue-control-track:')
      expect(block).toContain(
        '--macvue-switch-track: var(--macvue-control-track)',
      )
    }
  })

  it('emits per-size toggle tokens for all five control sizes', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
    const prefixes = [
      '--macvue-checkbox-size-',
      '--macvue-checkbox-radius-',
      '--macvue-checkbox-gap-',
      '--macvue-checkbox-check-width-',
      '--macvue-checkbox-check-height-',
      '--macvue-checkbox-dash-width-',
      '--macvue-checkbox-dash-height-',
      '--macvue-checkbox-row-height-',
      '--macvue-checkbox-font-size-',
      '--macvue-radio-size-',
      '--macvue-radio-dot-size-',
      '--macvue-radio-gap-',
      '--macvue-radio-row-height-',
      '--macvue-radio-font-size-',
      '--macvue-switch-track-width-',
      '--macvue-switch-track-height-',
      '--macvue-switch-thumb-width-',
      '--macvue-switch-thumb-height-',
      '--macvue-switch-thumb-inset-',
      '--macvue-switch-font-size-',
    ]
    for (const prefix of prefixes) {
      for (const size of sizes) expect(lightCss).toContain(`${prefix}${size}:`)
    }
    // Spot-check kit values.
    expect(lightCss).toContain('--macvue-checkbox-size-mini: 12px')
    expect(lightCss).toContain('--macvue-radio-dot-size-small: 4.8px')
    expect(lightCss).toContain('--macvue-switch-track-width-extra-large: 80px')
    expect(lightCss).toContain('--macvue-switch-thumb-height-mini: 13px')
  })

  it('emits per-size field tokens for all five control sizes', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
    const prefixes = [
      '--macvue-field-height-',
      '--macvue-field-radius-',
      '--macvue-field-padding-inline-start-',
      '--macvue-field-padding-inline-end-',
      '--macvue-field-font-size-',
      '--macvue-field-search-icon-width-',
      '--macvue-field-search-icon-height-',
      '--macvue-field-clear-size-',
    ]
    for (const prefix of prefixes) {
      for (const size of sizes) expect(lightCss).toContain(`${prefix}${size}:`)
    }
    // Spot-check kit values.
    expect(lightCss).toContain('--macvue-field-height-extra-large: 36px')
    expect(lightCss).toContain(
      '--macvue-field-radius-mini: var(--macvue-ref-radius-4)',
    )
    expect(lightCss).toContain(
      '--macvue-field-search-radius: var(--macvue-ref-radius-full)',
    )
  })

  it('re-declares themed field tokens in both theme islands', () => {
    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    const darkBlock = darkCss.match(
      /\[data-macvue-appearance='dark'\] \{([^}]*)\}/,
    )?.[1]
    for (const block of [lightBlock, darkBlock]) {
      expect(block).toBeDefined()
      expect(block).toContain('--macvue-field-bg: var(--macvue-control-bg)')
      expect(block).toContain(
        '--macvue-field-bg-disabled: var(--macvue-control-bg-disabled)',
      )
      expect(block).toContain(
        '--macvue-field-border: var(--macvue-border-control)',
      )
      expect(block).toContain(
        '--macvue-field-label-disabled: var(--macvue-label-disabled)',
      )
      expect(block).toContain('--macvue-focus-ring-border:')
    }
  })

  it('emits per-size slider and stepper tokens with kit values', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
    const prefixes = [
      '--macvue-slider-height-',
      '--macvue-slider-track-size-',
      '--macvue-slider-thumb-width-',
      '--macvue-slider-thumb-height-',
      '--macvue-slider-thumb-radius-',
      '--macvue-stepper-width-',
      '--macvue-stepper-height-',
      '--macvue-stepper-radius-',
      '--macvue-stepper-separator-width-',
      '--macvue-stepper-chevron-width-',
      '--macvue-stepper-chevron-height-',
    ]
    for (const prefix of prefixes) {
      for (const size of sizes) expect(lightCss).toContain(`${prefix}${size}:`)
    }
    // Spot-check kit values.
    expect(lightCss).toContain('--macvue-slider-thumb-width-regular: 20px')
    expect(lightCss).toContain('--macvue-slider-track-size-mini: 4px')
    expect(lightCss).toContain(
      '--macvue-slider-thumb-radius-large: var(--macvue-ref-radius-10)',
    )
    expect(lightCss).toContain('--macvue-stepper-width-extra-large: 30px')
    expect(lightCss).toContain(
      '--macvue-stepper-separator-width-regular: 14px',
    )
    expect(lightCss).toContain('--macvue-stepper-chevron-width-mini: 6.8px')
  })

  it('emits per-size segmented tokens with kit values', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini']
    const prefixes = [
      '--macvue-segmented-height-',
      '--macvue-segmented-radius-',
      '--macvue-segmented-padding-x-',
      '--macvue-segmented-font-size-',
      '--macvue-segmented-separator-height-',
    ]
    for (const prefix of prefixes) {
      for (const size of sizes) expect(lightCss).toContain(`${prefix}${size}:`)
    }
    // Spot-check kit values.
    expect(lightCss).toContain(
      '--macvue-segmented-padding-x-mini: var(--macvue-ref-spacing-4-5)',
    )
    expect(lightCss).toContain(
      '--macvue-segmented-separator-height-large: 18px',
    )
    expect(lightCss).toContain(
      '--macvue-segmented-radius-large: var(--macvue-ref-radius-full)',
    )
    expect(lightCss).toContain('--macvue-progress-height-small: 6px')
    expect(lightCss).toContain('--macvue-spinner-size-regular: 32px')
  })

  it('re-declares themed segmented/progress/spinner tokens in both islands', () => {
    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    const darkBlock = darkCss.match(
      /\[data-macvue-appearance='dark'\] \{([^}]*)\}/,
    )?.[1]
    for (const block of [lightBlock, darkBlock]) {
      expect(block).toBeDefined()
      expect(block).toContain(
        '--macvue-segmented-bg: var(--macvue-segmented-container)',
      )
      expect(block).toContain(
        '--macvue-segmented-on-bg-pressed: var(--macvue-segmented-on-pressed)',
      )
      expect(block).toContain(
        '--macvue-segmented-separator: var(--macvue-separator-on-control)',
      )
      expect(block).toContain(
        '--macvue-progress-track: var(--macvue-progress-bar-track)',
      )
      expect(block).toContain(
        '--macvue-spinner-blade-color: var(--macvue-spinner-color)',
      )
    }
  })

  it('re-declares the 2x disabled-compensation tokens in both theme islands', () => {
    const lightBlock = lightCss.match(
      /\[data-macvue-appearance='light'\] \{([^}]*)\}/,
    )?.[1]
    const darkBlock = darkCss.match(
      /\[data-macvue-appearance='dark'\] \{([^}]*)\}/,
    )?.[1]
    for (const block of [lightBlock, darkBlock]) {
      expect(block).toBeDefined()
      expect(block).toContain(
        '--macvue-checkbox-bg-on-disabled: var(--macvue-accent-disabled-strong)',
      )
      expect(block).toContain(
        '--macvue-radio-bg-on-disabled: var(--macvue-accent-disabled-strong)',
      )
      expect(block).toContain(
        '--macvue-switch-track-on-disabled: var(--macvue-accent-disabled-strong)',
      )
      expect(block).toContain(
        '--macvue-checkbox-bg-disabled: var(--macvue-control-disabled-strong)',
      )
      expect(block).toContain(
        '--macvue-radio-bg-disabled: var(--macvue-control-disabled-strong)',
      )
    }
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
    expect(darkCss).toContain(
      '--macvue-glass-panel-bg-clear: var(--macvue-material-glass-clear-bg)',
    )
    expect(darkCss).toContain(
      '--macvue-glass-panel-bg-regular: var(--macvue-material-glass-regular-bg)',
    )
  })

  it('keeps ref definitions and ref-only component tokens out of overrides', () => {
    expect(darkCss).not.toMatch(/--macvue-ref-[\w-]+:/)
    expect(darkCss).not.toMatch(/--macvue-button-height-[\w-]+:/)
    // Anchored on the colon so future button-radius-* tokens are caught too.
    expect(darkCss).not.toMatch(/--macvue-button-radius[\w-]*:/)
    expect(darkCss).not.toMatch(/--macvue-button-padding-x-[\w-]+:/)
  })
})

describe('tokens.gen.ts', () => {
  it('exports the token name type and a non-empty name list', () => {
    expect(tokenTs).toContain('export type MacvueTokenName')
    expect(tokenTs).toContain('export const macvueTokenNames')
    expect(tokenTs).toMatch(/'--macvue-[\w-]+',/)
  })
})

describe('styles/index.css reduced motion', () => {
  let indexCss: string

  beforeAll(async () => {
    indexCss = await readFile(
      join(import.meta.dirname, '../src/styles/index.css'),
      'utf8',
    )
  })

  it('zeroes every duration token inside the tokens layer, after the imports', () => {
    const layerBlock = indexCss.match(
      /@layer macvue\.tokens \{\s*@media \(prefers-reduced-motion: reduce\) \{\s*:root \{([^}]*)\}/,
    )
    expect(layerBlock).toBeTruthy()

    const lastImport = indexCss.lastIndexOf('@import')
    expect(lastImport).toBeGreaterThanOrEqual(0)
    expect(
      indexCss.indexOf('@media (prefers-reduced-motion: reduce)'),
    ).toBeGreaterThan(lastImport)

    const durations = [...new Set(lightCss.match(/--macvue-duration-[\w-]+/g))]
    expect(durations.length).toBeGreaterThan(0)
    for (const name of durations) {
      expect(layerBlock![1]).toContain(`${name}: 0ms`)
    }

    // Essential-motion durations live OUTSIDE the zero block: the spinner
    // keeps stepping, the indeterminate bar swaps to a static busy look
    // in its component CSS instead.
    expect(layerBlock![1]).not.toContain('--macvue-spinner-duration')
    expect(layerBlock![1]).not.toContain(
      '--macvue-progress-indeterminate-duration',
    )
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
