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
import { MacRadio, MacRadioGroup } from '../src'

// vitest-axe 0.1.0 only augments the pre-vitest-1 `Vi` global namespace,
// so the matcher types are re-declared here for vitest 4.
declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

function renderGroup(props: Record<string, unknown> = {}) {
  return render(MacRadioGroup, {
    props,
    slots: {
      default: () => [
        h(MacRadio, { value: 'first' }, () => 'First'),
        h(MacRadio, { value: 'second' }, () => 'Second'),
        h(MacRadio, { value: 'third' }, () => 'Third'),
      ],
    },
  })
}

describe('macRadioGroup', () => {
  it('renders a radiogroup with radio items and captions', () => {
    const { getByRole, getAllByRole } = renderGroup()
    expect(getByRole('radiogroup')).toBeTruthy()
    const radios = getAllByRole('radio')
    expect(radios).toHaveLength(3)
    expect(radios[0].tagName).toBe('BUTTON')
    expect(radios[0].closest('label')?.textContent).toContain('First')
  })

  it('selects the defaultValue item (uncontrolled)', () => {
    const { getAllByRole } = renderGroup({ defaultValue: 'second' })
    const radios = getAllByRole('radio')
    expect(radios[1].getAttribute('data-state')).toBe('checked')
    expect(radios[0].getAttribute('data-state')).toBe('unchecked')
  })

  it('supports v-model (controlled) and emits on click', async () => {
    const { getAllByRole, rerender, emitted } = renderGroup({
      modelValue: 'first',
    })
    const radios = getAllByRole('radio')
    expect(radios[0].getAttribute('data-state')).toBe('checked')

    await userEvent.click(radios[2])
    expect(emitted('update:modelValue')[0]).toEqual(['third'])

    await rerender({ modelValue: 'third' })
    expect(radios[2].getAttribute('data-state')).toBe('checked')
  })

  it('clicking the caption selects the radio', async () => {
    const { getByText, getAllByRole } = renderGroup()
    await userEvent.click(getByText('Second'))
    expect(getAllByRole('radio')[1].getAttribute('data-state')).toBe('checked')
  })

  it('moves selection with arrow keys', async () => {
    const user = userEvent.setup()
    const { getAllByRole } = renderGroup({ defaultValue: 'first' })
    const radios = getAllByRole('radio')

    await user.click(radios[0])
    // Hold the key across the assertion: Reka selects the newly focused radio
    // in a setTimeout(0) that checks the arrow key is still pressed.
    await user.keyboard('{ArrowDown>}')
    await new Promise(resolve => setTimeout(resolve, 0))
    await user.keyboard('{/ArrowDown}')
    expect(document.activeElement).toBe(radios[1])
    expect(radios[1].getAttribute('data-state')).toBe('checked')

    await user.keyboard('{ArrowUp>}')
    await new Promise(resolve => setTimeout(resolve, 0))
    await user.keyboard('{/ArrowUp}')
    expect(document.activeElement).toBe(radios[0])
    expect(radios[0].getAttribute('data-state')).toBe('checked')
  })

  it('moves selection with horizontal arrows too (APG: all four arrows work)', async () => {
    const user = userEvent.setup()
    const { getAllByRole } = renderGroup({ defaultValue: 'first' })
    const radios = getAllByRole('radio')

    await user.click(radios[0])
    await user.keyboard('{ArrowRight>}')
    await new Promise(resolve => setTimeout(resolve, 0))
    await user.keyboard('{/ArrowRight}')
    expect(document.activeElement).toBe(radios[1])
    expect(radios[1].getAttribute('data-state')).toBe('checked')

    await user.keyboard('{ArrowLeft>}')
    await new Promise(resolve => setTimeout(resolve, 0))
    await user.keyboard('{/ArrowLeft}')
    expect(document.activeElement).toBe(radios[0])
    expect(radios[0].getAttribute('data-state')).toBe('checked')
  })

  it('participates in a native form through name via a hidden input', async () => {
    const { container } = render({
      render() {
        return h('form', [
          h(
            MacRadioGroup,
            {
              'name': 'sort',
              'defaultValue': 'kind',
              'aria-label': 'Sort by',
            },
            () => [
              h(MacRadio, { value: 'name' }, () => 'Name'),
              h(MacRadio, { value: 'kind' }, () => 'Kind'),
            ],
          ),
        ])
      },
    })
    await nextTick()
    const input
      = container.querySelector<HTMLInputElement>('input[name="sort"]')
    expect(input).toBeTruthy()
    expect(input!.value).toBe('kind')
  })

  it('disables the whole group', async () => {
    const { getAllByRole, emitted } = renderGroup({ disabled: true })
    const radios = getAllByRole('radio') as HTMLButtonElement[]
    expect(radios.every(radio => radio.disabled)).toBe(true)
    await userEvent.click(radios[0])
    expect(emitted()).not.toHaveProperty('update:modelValue')
  })

  it('disables a single item and suppresses caption clicks', async () => {
    const { getByText, getAllByRole } = render({
      render() {
        return h(MacRadioGroup, {}, () => [
          h(MacRadio, { value: 'first' }, () => 'First'),
          h(MacRadio, { value: 'second', disabled: true }, () => 'Second'),
        ])
      },
    })
    await userEvent.click(getByText('Second'))
    expect(getAllByRole('radio')[1].getAttribute('data-state')).toBe(
      'unchecked',
    )
  })

  it('applies the orientation class and aria-orientation (vertical by default)', () => {
    const { getByRole, unmount } = renderGroup()
    const group = getByRole('radiogroup')
    expect(group.classList.contains('macvue-radio-group--vertical')).toBe(true)
    expect(group.getAttribute('aria-orientation')).toBe('vertical')
    unmount()

    const { getByRole: getByRole2 } = renderGroup({
      orientation: 'horizontal',
    })
    const horizontal = getByRole2('radiogroup')
    expect(
      horizontal.classList.contains('macvue-radio-group--horizontal'),
    ).toBe(true)
    expect(horizontal.getAttribute('aria-orientation')).toBe('horizontal')
  })

  it('forwards aria-label and listeners to the radio control, not the label', async () => {
    const onFocus = vi.fn()
    const { getByRole } = render(MacRadioGroup, {
      attrs: { 'aria-label': 'Options' },
      slots: {
        default: () =>
          h(MacRadio, {
            'value': 'first',
            'aria-label': 'First option',
            onFocus,
          }),
      },
    })
    const radio = getByRole('radio', { name: 'First option' })
    expect(radio.getAttribute('aria-label')).toBe('First option')
    expect(radio.closest('label')!.hasAttribute('aria-label')).toBe(false)

    radio.focus()
    expect(onFocus).toHaveBeenCalled()
  })

  it('exposes focus(), blur() and el on group and item', async () => {
    interface Exposed {
      focus: () => void
      blur: () => void
      el: HTMLElement | null
    }
    let group: Exposed | undefined
    let item: Exposed | undefined
    const { getByRole, getAllByRole } = render({
      setup() {
        const groupRef = ref<Exposed>()
        const itemRef = ref<Exposed>()
        onMounted(() => {
          group = groupRef.value
          item = itemRef.value
        })
        return () =>
          h(MacRadioGroup, { ref: groupRef }, () => [
            h(MacRadio, { ref: itemRef, value: 'first' }, () => 'First'),
            h(MacRadio, { value: 'second' }, () => 'Second'),
          ])
      },
    })
    await nextTick()
    const radios = getAllByRole('radio')

    expect(group!.el).toBe(getByRole('radiogroup'))
    expect(item!.el).toBe(radios[0])

    group!.focus()
    expect(document.activeElement).toBe(radios[0])
    group!.blur()
    expect(document.activeElement).not.toBe(radios[0])

    item!.focus()
    expect(document.activeElement).toBe(radios[0])
    item!.blur()
    expect(document.activeElement).not.toBe(radios[0])
  })

  it('has no axe violations across states', async () => {
    const { container } = render({
      render() {
        return h('div', [
          h(
            MacRadioGroup,
            { 'defaultValue': 'first', 'aria-label': 'Options' },
            () => [
              h(MacRadio, { value: 'first' }, () => 'First'),
              h(MacRadio, { value: 'second' }, () => 'Second'),
              h(MacRadio, { value: 'third', disabled: true }, () => 'Third'),
            ],
          ),
          h(
            MacRadioGroup,
            { 'disabled': true, 'aria-label': 'Disabled options' },
            () => [h(MacRadio, { value: 'only' }, () => 'Only')],
          ),
        ])
      },
    })
    expect(await axe(container)).toHaveNoViolations()
  })

  describe('radio-group.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(
          import.meta.dirname,
          '../src/components/radio-group/radio-group.css',
        ),
        'utf8',
      )
    })

    it('has no :hover and no transition (macOS radios have neither)', () => {
      expect(css).not.toContain(':hover')
      expect(css).not.toContain('transition')
    })

    it('keeps the macOS arrow cursor and non-selectable caption', () => {
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

    it('doubles the disabled fills so the row dim lands on the kit values', () => {
      expect(css).toContain('[data-state=\'checked\'][data-disabled]')
      expect(css).toContain('var(--macvue-radio-bg-on-disabled)')
      expect(css).toContain('var(--macvue-radio-bg-disabled)')
    })
  })
})
