import { readdir, readFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { parse } from 'vue/compiler-sfc'

// Stand demos (glass scenes) carry inspectors, backdrops and pointer logic
// that a reader must never copy, so their Code tab points at a sibling
// `<Section>.example.vue`. Examples are rendered nowhere, which makes this
// guard the only thing standing between them and silent rot.

const docsDir = join(import.meta.dirname, '../../../docs')
const demosDir = join(docsDir, 'demos')

let examples: string[]
let exports: string
let markdown: { file: string, source: string }[]

async function vueFiles(dir: string) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.vue'))
    .map(entry => join(entry.parentPath, entry.name))
}

async function markdownFiles(dir: string) {
  const entries = await readdir(dir, { recursive: true, withFileTypes: true })
  return entries
    .filter(entry => entry.isFile() && entry.name.endsWith('.md'))
    .map(entry => join(entry.parentPath, entry.name))
}

beforeAll(async () => {
  const all = await vueFiles(demosDir)
  examples = all.filter(file => file.endsWith('.example.vue'))
  exports = await readFile(
    join(import.meta.dirname, '../src/index.ts'),
    'utf8',
  )
  markdown = await Promise.all(
    (await markdownFiles(docsDir))
      .filter(file => !file.includes('node_modules'))
      .map(async file => ({ file, source: await readFile(file, 'utf8') })),
  )
})

describe('docs demo examples', () => {
  it('parses every example as a valid SFC', async () => {
    expect(examples.length).toBeGreaterThan(0)

    for (const file of examples) {
      const { errors } = parse(await readFile(file, 'utf8'), {
        filename: file,
      })
      expect(errors, `${basename(file)} must parse`).toEqual([])
    }
  })

  it('only imports components the package actually exports', async () => {
    for (const file of examples) {
      const source = await readFile(file, 'utf8')
      const imported = source.match(/import \{([^}]*)\} from 'macvue'/)?.[1]
      expect(
        imported,
        `${basename(file)} must import from macvue`,
      ).toBeDefined()

      for (const name of imported!
        .split(',')
        .map(part => part.trim())
        .filter(Boolean)) {
        expect(
          exports.includes(name),
          `${basename(file)} imports ${name}, which the package does not export`,
        ).toBe(true)
      }
    }
  })

  it('keeps the stand out of the Code tab wherever an example exists', () => {
    for (const file of examples) {
      const stand = file.replace('.example.vue', '.vue')
      const snippet = `<<< @/demos/${stand.slice(demosDir.length + 1)}`

      for (const { file: page, source } of markdown) {
        expect(
          source.includes(snippet),
          `${basename(page)} embeds the stand ${snippet}; it must embed the example instead`,
        ).toBe(false)
      }
    }
  })
})
