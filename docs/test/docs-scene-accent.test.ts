import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// The docs theme mirrors the accent-derived token chain on `.mv-scene`
// (per-scene --macvue-accent never reaches derivatives declared at :root).
// This guard keeps the mirror in sync with the generated tokens.

let lightCss: string
let scenesCss: string

beforeAll(async () => {
  lightCss = await readFile(
    join(import.meta.dirname, '../src/styles/tokens.gen.css'),
    'utf8',
  )
  scenesCss = await readFile(
    join(
      import.meta.dirname,
      '../../../docs/.vitepress/theme/styles/scenes.css',
    ),
    'utf8',
  )
})

describe('docs scene accent mirror', () => {
  it('redeclares every accent-derived token from tokens.gen.css in .mv-scene', () => {
    const accentDerived = [
      ...new Set(
        [
          ...lightCss.matchAll(
            /(--macvue-[\w-]+):([^;]*var\(--macvue-accent[^;]*);/g,
          ),
        ].map(match => match[1]),
      ),
    ]
    expect(accentDerived.length).toBeGreaterThan(0)

    const sceneBlock = scenesCss.match(/\.mv-scene \{([^}]*)\}/)?.[1]
    expect(sceneBlock).toBeDefined()

    for (const name of accentDerived) {
      expect(sceneBlock, `${name} must be mirrored in .mv-scene`).toContain(
        `${name}:`,
      )
    }
  })
})
