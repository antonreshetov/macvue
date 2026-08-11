import { render, waitFor } from '@testing-library/vue'
import { commands } from 'vitest/browser'
import { h, nextTick } from 'vue'
import {
  MacPopUpButton,
  MacPopUpButtonItem,
  MacPullDownButton,
  MacPullDownButtonItem,
} from '../../src'

interface Point {
  x: number
  y: number
}

declare module 'vitest/browser' {
  interface BrowserCommands {
    mouseDown: (at: Point) => Promise<void>
    mouseMove: (from: Point, to: Point) => Promise<void>
    mouseUp: (at?: Point) => Promise<void>
    keyPress: (key: string) => Promise<void>
    dragSelectOption: (
      triggerName: string,
      optionName: string,
    ) => Promise<void>
  }
}

function center(element: Element): Point {
  const bounds = element.getBoundingClientRect()
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  }
}

function renderPopUp(props: Record<string, unknown> = {}) {
  return render(MacPopUpButton, {
    props: {
      'aria-label': 'Color',
      'defaultValue': 'red',
      'teleportTo': false,
      ...props,
    },
    slots: {
      default: () => [
        h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
        h(MacPopUpButtonItem, { value: 'green' }, () => 'Green'),
        h(MacPopUpButtonItem, { value: 'blue' }, () => 'Blue'),
      ],
    },
  })
}

describe('macPopUpButton interactions (browser)', () => {
  it('opens on pointer down', async () => {
    const { getByRole } = renderPopUp()
    const trigger = getByRole('combobox')
    const triggerPoint = center(trigger)

    await commands.mouseDown(triggerPoint)
    await nextTick()
    expect(trigger.getAttribute('aria-expanded')).toBe('true')
    await commands.mouseUp()
    await commands.keyPress('Escape')
  })

  it('supports physical press-drag-release selection', async () => {
    const { emitted, getByRole } = renderPopUp()
    const trigger = getByRole('combobox')

    await commands.dragSelectOption('Color', 'Green')
    await nextTick()

    expect(emitted('update:modelValue')).toEqual([['green']])
    expect(trigger.textContent).toContain('Green')
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
  })

  it('supports typeahead, Escape dismissal and focus return', async () => {
    const { getByRole, queryByRole } = renderPopUp()
    const trigger = getByRole('combobox')
    trigger.focus()

    await commands.keyPress('Space')
    await nextTick()
    expect(getByRole('listbox')).toBeTruthy()

    await commands.keyPress('g')
    await nextTick()
    expect(document.activeElement).toBe(getByRole('option', { name: 'Green' }))

    await commands.keyPress('Escape')
    await nextTick()
    expect(queryByRole('listbox')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })

  it('keeps the stable menu material inside a local glass-off boundary', async () => {
    const { getByRole } = render({
      render() {
        return h(
          'div',
          { 'data-macvue-glass': 'on' },
          h(
            'div',
            {
              'data-macvue-appearance': 'light',
              'data-macvue-glass': 'off',
            },
            h(
              MacPopUpButton,
              {
                'aria-label': 'Color',
                'defaultValue': 'red',
                'defaultOpen': true,
                'teleportTo': false,
              },
              () => h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
            ),
          ),
        )
      },
    })
    await nextTick()

    const menu = getByRole('listbox').querySelector<HTMLElement>(
      '.macvue-pop-up-button-menu',
    )!
    expect(getComputedStyle(menu).backgroundColor).toBe(
      'rgba(246, 246, 246, 0.94)',
    )
    expect(menu.hasAttribute('data-macvue-glass-ready')).toBe(false)
  })

  it('does not shift sibling controls when local content opens', async () => {
    const { getByRole } = render({
      render() {
        return h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: '72px 94px',
              justifyContent: 'center',
              gap: '8px',
            },
          },
          [
            h('span', 'pop up'),
            h(
              MacPopUpButton,
              {
                'aria-label': 'Stable pop up',
                'defaultValue': 'red',
                'teleportTo': false,
              },
              () => [
                h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
                h(MacPopUpButtonItem, { value: 'green' }, () => 'Green'),
              ],
            ),
            h('span', 'pull down'),
            h(MacPullDownButton, {
              'aria-label': 'Stable pull down',
              'label': 'Actions',
              'teleportTo': false,
            }),
          ],
        )
      },
    })
    const trigger = getByRole('combobox', { name: 'Stable pop up' })
    const sibling = getByRole('button', { name: 'Stable pull down' })
    const before = {
      trigger: trigger.getBoundingClientRect(),
      sibling: sibling.getBoundingClientRect(),
    }

    trigger.focus()
    await commands.keyPress('Space')
    await nextTick()

    const after = {
      trigger: trigger.getBoundingClientRect(),
      sibling: sibling.getBoundingClientRect(),
    }
    expect(after.trigger.x).toBeCloseTo(before.trigger.x, 1)
    expect(after.trigger.y).toBeCloseTo(before.trigger.y, 1)
    expect(after.sibling.x).toBeCloseTo(before.sibling.x, 1)
    expect(after.sibling.y).toBeCloseTo(before.sibling.y, 1)
    await commands.keyPress('Escape')
  })

  it('matches native menu registration at every control size', async () => {
    const sizes = ['mini', 'small', 'regular', 'large', 'extra-large'] as const
    const popUpInlineOffsets = [-5, -12, -13, -13, -13]
    const pullDownInlineOffsets = [-3, -4, -5, -5, -5]
    const pullDownBlockOffsets = [0, 1, 2, 2, 2]
    const { getByRole } = render({
      render() {
        return h(
          'div',
          {
            style: {
              display: 'grid',
              gridTemplateColumns: 'max-content max-content',
              gap: '8px 16px',
              padding: '100px',
            },
          },
          sizes.flatMap(size => [
            h(
              MacPopUpButton,
              {
                'aria-label': `${size} pop up`,
                'defaultValue': 'red',
                'size': size,
                'teleportTo': false,
              },
              () => [
                h(MacPopUpButtonItem, { value: 'red' }, () => 'Red'),
                h(MacPopUpButtonItem, { value: 'green' }, () => 'Green'),
              ],
            ),
            h(
              MacPullDownButton,
              {
                'aria-label': `${size} pull down`,
                'label': 'Actions',
                'size': size,
                'teleportTo': false,
              },
              () => [
                h(MacPullDownButtonItem, {}, () => 'New'),
                h(MacPullDownButtonItem, {}, () => 'Open…'),
              ],
            ),
          ]),
        )
      },
    })

    for (const [index, size] of sizes.entries()) {
      const popUpTrigger = getByRole('combobox', {
        name: `${size} pop up`,
      })
      popUpTrigger.focus()
      await commands.keyPress('Space')
      await nextTick()
      const popUpMenu = getByRole('listbox').querySelector<HTMLElement>(
        '.macvue-pop-up-button-menu',
      )!
      const popUpTriggerBounds = popUpTrigger.getBoundingClientRect()
      const popUpMenuBounds = popUpMenu.getBoundingClientRect()
      expect(popUpMenuBounds.x - popUpTriggerBounds.x).toBeCloseTo(
        popUpInlineOffsets[index]!,
        0,
      )
      expect(popUpMenuBounds.y - popUpTriggerBounds.y).toBeCloseTo(-5, 0)
      await commands.keyPress('Escape')

      const pullDownTrigger = getByRole('button', {
        name: `${size} pull down`,
      })
      pullDownTrigger.focus()
      await commands.keyPress('Space')
      await nextTick()
      const pullDownMenu = getByRole('menu').querySelector<HTMLElement>(
        '.macvue-pop-up-button-menu',
      )!
      await waitFor(() => {
        expect(pullDownMenu.getBoundingClientRect().width).toBeGreaterThan(0)
      })
      const pullDownTriggerBounds = pullDownTrigger.getBoundingClientRect()
      const pullDownMenuBounds = pullDownMenu.getBoundingClientRect()
      expect(pullDownMenuBounds.x - pullDownTriggerBounds.x).toBeCloseTo(
        pullDownInlineOffsets[index]!,
        0,
      )
      expect(pullDownMenuBounds.y - pullDownTriggerBounds.bottom).toBeCloseTo(
        pullDownBlockOffsets[index]!,
        0,
      )
      await commands.keyPress('Escape')
    }
  })
})
