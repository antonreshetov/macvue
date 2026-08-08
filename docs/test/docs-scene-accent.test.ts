import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// The docs theme mirrors the accent-derived token chain on `.mv-scene`
// (per-scene --macvue-accent never reaches derivatives declared at :root).
// Light and dark formulas diverged in the Tahoe rebase (black vs white
// overlays), so the mirror has a light block and a dark block; this guard
// keeps both in sync with the generated tokens — names AND right-hand sides.

let lightCss: string
let darkCss: string
let scenesCss: string

const normalize = (value: string) => value.replaceAll(/\s+/g, ' ').trim()

// Declarations whose value depends on --macvue-accent (directly or through
// another accent-derived variable such as --macvue-accent-pressed).
function accentDerived(css: string) {
  const map = new Map<string, string>()
  for (const match of css.matchAll(
    /(--macvue-[\w-]+):([^;]*var\(--macvue-accent[^;]*);/g,
  )) {
    map.set(match[1], normalize(match[2]))
  }
  return map
}

function declarations(block: string) {
  const map = new Map<string, string>()
  for (const match of block.matchAll(/(--macvue-[\w-]+):([^;]*);/g))
    map.set(match[1], normalize(match[2]))
  return map
}

beforeAll(async () => {
  const stylesDir = join(import.meta.dirname, '../src/styles')
  lightCss = await readFile(join(stylesDir, 'tokens.gen.css'), 'utf8')
  darkCss = await readFile(join(stylesDir, 'tokens-dark.gen.css'), 'utf8')
  scenesCss = await readFile(
    join(
      import.meta.dirname,
      '../../../docs/.vitepress/theme/styles/scenes.css',
    ),
    'utf8',
  )
})

describe('docs scene accent mirror', () => {
  it('mirrors every accent-derived light token in .mv-scene with the exact formula', () => {
    const expected = accentDerived(lightCss)
    expect(expected.size).toBeGreaterThan(0)

    const sceneBlock = scenesCss.match(/\.mv-scene \{([^}]*)\}/)?.[1]
    expect(sceneBlock).toBeDefined()
    const mirrored = declarations(sceneBlock!)

    for (const [name, value] of expected) {
      expect(
        mirrored.get(name),
        `${name} must be mirrored in .mv-scene with the light formula`,
      ).toBe(value)
    }
  })

  it('mirrors every accent-derived dark token in the dark scene block with the exact formula', () => {
    const expected = accentDerived(darkCss)
    expect(expected.size).toBeGreaterThan(0)

    const darkBlock = scenesCss.match(
      /\.mv-scene\[data-macvue-appearance='dark'\][^{]*\{([^}]*)\}/,
    )?.[1]
    expect(darkBlock).toBeDefined()
    const mirrored = declarations(darkBlock!)

    for (const [name, value] of expected) {
      expect(
        mirrored.get(name),
        `${name} must be mirrored in the dark .mv-scene block with the dark formula`,
      ).toBe(value)
    }
  })

  it('scopes the dark mirror to dark scenes on light pages and non-light scenes on dark pages', () => {
    expect(scenesCss).toContain(
      '.mv-scene[data-macvue-appearance=\'dark\'],\n[data-macvue-appearance=\'dark\'] .mv-scene:not([data-macvue-appearance=\'light\'])',
    )
  })
})
