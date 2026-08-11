// @vitest-environment jsdom
import type { MacPopUpButtonProps } from '../src'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import userEvent from '@testing-library/user-event'
import { fireEvent, render } from '@testing-library/vue'
import { axe } from 'vitest-axe'
import * as matchers from 'vitest-axe/matchers'
import { h, nextTick, onMounted, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import {
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
} from '../src'

declare module 'vitest' {
  // eslint-disable-next-line unused-imports/no-unused-vars -- merged declarations must repeat vitest's type parameter
  interface Matchers<T = any> extends matchers.AxeMatchers {}
}

expect.extend(matchers)

// Pointer capture and layout observers are browser APIs used by Reka Select
// but intentionally absent from jsdom.
HTMLElement.prototype.hasPointerCapture ??= () => false
HTMLElement.prototype.releasePointerCapture ??= () => {}
HTMLElement.prototype.scrollIntoView ??= () => {}
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver
  ??= ResizeObserverStub as unknown as typeof ResizeObserver

function renderPopUp(
  props: MacPopUpButtonProps & Record<string, unknown> = {},
) {
  return render(MacPopUpButton, {
    props: {
      'aria-label': 'Color',
      'teleportTo': false,
      ...props,
    },
    slots: {
      default: () => [
        h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
        h(MacPopUpButtonItem, { value: 'green' }, () => 'Green'),
        h(MacPopUpButtonItem, { value: 'blue', disabled: true }, () => 'Blue'),
      ],
    },
  })
}

function renderPullDown(
  props: Record<string, unknown> = {},
  onSelect = vi.fn(),
) {
  return {
    onSelect,
    ...render(MacPullDownButton, {
      attrs: {
        'aria-label': 'Actions',
      },
      props: {
        label: 'Actions',
        teleportTo: false,
        ...props,
      },
      slots: {
        default: () => [
          h(MacPullDownButtonItem, { onSelect }, () => 'New'),
          h(MacPullDownButtonItem, {}, () => 'Open…'),
        ],
      },
    }),
  }
}

async function open(trigger: HTMLElement) {
  await fireEvent.pointerDown(trigger, {
    button: 0,
    ctrlKey: false,
    pointerType: 'mouse',
    pointerId: 1,
  })
  await fireEvent.pointerUp(trigger, {
    button: 0,
    pointerType: 'mouse',
    pointerId: 1,
  })
  await nextTick()
}

describe('macPopUpButton', () => {
  it('renders the selected label and falls attrs through to the trigger', async () => {
    const { getByRole } = renderPopUp({
      'defaultValue': 'red',
      'class': 'custom-trigger',
      'data-testid': 'trigger',
    })
    await nextTick()
    const trigger = getByRole('combobox')
    expect(trigger.textContent).toContain('Red')
    expect(trigger.classList.contains('custom-trigger')).toBe(true)
    expect(trigger.getAttribute('data-testid')).toBe('trigger')
  })

  it('supports uncontrolled value selection', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderPopUp({ defaultValue: 'red' })
    const trigger = getByRole('combobox')
    await open(trigger)
    await user.click(getByRole('option', { name: 'Green' }))
    expect(trigger.textContent).toContain('Green')
  })

  it('emits controlled value updates without changing the displayed value', async () => {
    const user = userEvent.setup()
    const { emitted, getByRole } = renderPopUp({ modelValue: 'red' })
    const trigger = getByRole('combobox')
    await open(trigger)
    await user.click(getByRole('option', { name: 'Green' }))
    expect(emitted('update:modelValue')).toEqual([['green']])
    expect(trigger.textContent).toContain('Red')
  })

  it('supports uncontrolled and controlled open state', async () => {
    const uncontrolled = renderPopUp({ defaultOpen: true })
    await nextTick()
    expect(uncontrolled.getByRole('listbox')).toBeTruthy()
    uncontrolled.unmount()

    const controlled = renderPopUp({ open: false })
    await open(controlled.getByRole('combobox'))
    expect(controlled.emitted('update:open')).toEqual([[true]])
    expect(controlled.queryByRole('listbox')).toBeNull()
  })

  it('closes with Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup()
    const { getByRole, queryByRole } = renderPopUp({ defaultValue: 'red' })
    const trigger = getByRole('combobox')
    trigger.focus()
    await open(trigger)
    expect(getByRole('listbox')).toBeTruthy()
    await user.keyboard('{Escape}')
    await nextTick()
    expect(queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('uses typeahead and does not select a disabled item', async () => {
    const user = userEvent.setup()
    const { getByRole } = renderPopUp({ defaultValue: 'red' })
    const trigger = getByRole('combobox')
    trigger.focus()
    await open(trigger)
    await user.keyboard('g')
    await nextTick()
    expect(document.activeElement).toBe(getByRole('option', { name: 'Green' }))
    await user.keyboard('{Enter}')
    expect(trigger.textContent).toContain('Green')

    await open(trigger)
    const disabled = getByRole('option', { name: 'Blue' })
    expect(disabled.getAttribute('aria-disabled')).toBe('true')
    await user.click(disabled)
    expect(trigger.textContent).toContain('Green')
  })

  it('disables interaction and integrates with forms', async () => {
    const disabled = renderPopUp({ disabled: true, defaultValue: 'red' })
    const trigger = disabled.getByRole('combobox') as HTMLButtonElement
    expect(trigger.disabled).toBe(true)
    await open(trigger)
    expect(disabled.queryByRole('listbox')).toBeNull()
    disabled.unmount()

    const form = render({
      render() {
        return h('form', [
          h(
            MacPopUpButton,
            {
              'aria-label': 'Color',
              'name': 'color',
              'required': true,
              'autocomplete': 'off',
              'defaultValue': 'green',
              'teleportTo': false,
            },
            () => [
              h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
              h(MacPopUpButtonItem, { value: 'green' }, () => 'Green'),
            ],
          ),
        ])
      },
    })
    await nextTick()
    const select = form.container.querySelector<HTMLSelectElement>('select')
    expect(select?.name).toBe('color')
    expect(select?.required).toBe(true)
    expect(select?.value).toBe('green')
  })

  it('renders all five size modifiers', () => {
    const sizes = ['extra-large', 'large', 'regular', 'small', 'mini'] as const
    for (const size of sizes) {
      const { getByRole, unmount } = renderPopUp({ size })
      expect(getByRole('combobox').classList).toContain(
        `macvue-pop-up-button--${size}`,
      )
      unmount()
    }
  })

  it('forwards direction to the Select root and its open content', async () => {
    const { getByRole } = renderPopUp({ dir: 'rtl', defaultOpen: true })
    await nextTick()
    expect(getByRole('combobox', { hidden: true }).getAttribute('dir')).toBe(
      'rtl',
    )
    expect(getByRole('listbox').getAttribute('dir')).toBe('rtl')
  })

  it('exposes el, focus and blur on the trigger', async () => {
    interface Exposed {
      el: HTMLButtonElement | null
      focus: () => void
      blur: () => void
    }
    let exposed: Exposed | undefined
    render({
      setup() {
        const control = ref<Exposed>()
        onMounted(() => {
          exposed = control.value
        })
        return () =>
          h(
            MacPopUpButton,
            { ref: control, defaultValue: 'red', teleportTo: false },
            () => h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
          )
      },
    })
    await nextTick()
    expect(exposed?.el?.getAttribute('role')).toBe('combobox')
    exposed?.focus()
    expect(document.activeElement).toBe(exposed?.el)
    exposed?.blur()
    expect(document.activeElement).not.toBe(exposed?.el)
  })

  it('has no axe violations when closed and open', async () => {
    const closed = renderPopUp({ defaultValue: 'red' })
    await nextTick()
    expect(await axe(closed.container)).toHaveNoViolations()
    closed.unmount()

    const opened = renderPopUp({ defaultValue: 'red', defaultOpen: true })
    await nextTick()
    expect(await axe(opened.container)).toHaveNoViolations()
  })

  it('renders on the server without browser globals', async () => {
    const html = await renderToString(
      h(MacPopUpButton, { defaultValue: 'red', teleportTo: false }, () =>
        h(MacPopUpButtonItem, { value: 'red' }, () => 'Red')),
    )
    expect(html).toContain('role="combobox"')
    expect(html).toContain('macvue-pop-up-button-chevron')
  })

  describe('pop-up-button.css guards', () => {
    let css: string

    beforeAll(async () => {
      css = await readFile(
        join(
          import.meta.dirname,
          '../src/components/pop-up-button/pop-up-button.css',
        ),
        'utf8',
      )
    })

    it('uses component tokens instead of raw pixel or color values', () => {
      expect(css).not.toMatch(/#[0-9a-f]{3,8}/i)
      expect(css.match(/[\d.]+px/g) ?? []).toHaveLength(0)
    })

    it('covers reduced transparency and forced colors', () => {
      expect(css).toContain('@media (prefers-reduced-transparency: reduce)')
      expect(css).toContain('@media (forced-colors: active)')
      expect(css).toContain('--macvue-pop-up-button-menu-opaque-bg')
      expect(css).toContain('background: Highlight')
    })

    it('keeps clear refraction on the menu and an opaque trigger', async () => {
      const tokenSource = await readFile(
        join(import.meta.dirname, '../tokens/component/pop-up-button.json'),
        'utf8',
      )
      expect(tokenSource).toContain(
        '"menu-glass-bg": { "$type": "color", "$value": "{semantic.material-glass-clear-bg}" }',
      )
      expect(tokenSource).toContain(
        '"bg": { "$type": "color", "$value": "{semantic.control-button-opaque}" }',
      )
    })
  })
})

describe('macPullDownButton', () => {
  it('renders a command label and emits item selection', async () => {
    const user = userEvent.setup()
    const { getByRole, onSelect } = renderPullDown()
    const trigger = getByRole('button', { name: 'Actions' })
    expect(trigger.textContent).toContain('Actions')

    await user.click(trigger)
    await user.click(getByRole('menuitem', { name: 'New' }))
    expect(onSelect).toHaveBeenCalledOnce()
  })

  it('supports controlled open state and disabled triggers', async () => {
    const controlled = renderPullDown({ open: false })
    await userEvent
      .setup()
      .click(controlled.getByRole('button', { name: 'Actions' }))
    expect(controlled.emitted('update:open')).toEqual([[true]])
    expect(controlled.queryByRole('menu')).toBeNull()
    controlled.unmount()

    const disabled = renderPullDown({ disabled: true })
    const trigger = disabled.getByRole('button', {
      name: 'Actions',
    }) as HTMLButtonElement
    expect(trigger.disabled).toBe(true)
    await userEvent.setup().click(trigger)
    expect(disabled.queryByRole('menu')).toBeNull()
  })
})
