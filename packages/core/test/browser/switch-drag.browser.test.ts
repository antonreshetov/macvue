import { render } from '@testing-library/vue'
import { commands } from 'vitest/browser'
import { h, nextTick } from 'vue'
import { MacSwitch } from '../../src'

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
  }
}

describe('macSwitch range gestures (browser)', () => {
  function geometry(control: HTMLElement) {
    const trackEl = control.parentElement!.querySelector<HTMLElement>(
      '.macvue-switch-control',
    )!
    const track = trackEl.getBoundingClientRect()
    const thumb = trackEl
      .querySelector('.macvue-switch-thumb')!
      .getBoundingClientRect()
    const y = track.y + track.height / 2
    return {
      thumb: { x: thumb.x + thumb.width / 2, y },
      farLeft: { x: track.x + track.width * 0.1, y },
      sameLeft: { x: track.x + track.width * 0.4, y },
      farRight: { x: track.x + track.width * 0.9, y },
    }
  }

  async function gesture(from: Point, to: Point) {
    await commands.mouseDown(from)
    await commands.mouseMove(from, to)
    await commands.mouseUp()
  }

  it('moves the thumb while held, then commits OFF to ON once', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const thumbEl = control.parentElement!.querySelector<HTMLElement>(
      '.macvue-switch-thumb',
    )!
    const { thumb, farRight } = geometry(control)

    await commands.mouseDown(thumb)
    await commands.mouseMove(thumb, farRight)

    expect(control.getAttribute('data-state')).toBe('checked')
    expect(thumbEl.style.transform).toMatch(/^translateX\([\d.]+px\)$/)
    expect(
      Number.parseFloat(thumbEl.style.transform.slice(11)),
    ).toBeGreaterThan(0)
    expect(emitted('update:modelValue')).toBeUndefined()

    await commands.mouseUp()
    expect(control.getAttribute('data-state')).toBe('checked')
    expect(thumbEl.style.transform).toBe('')
    expect(emitted('update:modelValue')).toEqual([[true]])
  })

  it('previews both states while held and commits only the release side', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const thumbEl = control.parentElement!.querySelector<HTMLElement>(
      '.macvue-switch-thumb',
    )!
    const { thumb, farLeft, farRight } = geometry(control)

    await commands.mouseDown(thumb)
    await commands.mouseMove(thumb, farRight)
    const rightOffset = Number.parseFloat(thumbEl.style.transform.slice(11))
    expect(control.getAttribute('data-state')).toBe('checked')
    expect(emitted('update:modelValue')).toBeUndefined()

    await commands.mouseMove(farRight, farLeft)
    const leftOffset = Number.parseFloat(thumbEl.style.transform.slice(11))
    expect(leftOffset).toBeLessThan(rightOffset)
    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toBeUndefined()

    await commands.mouseMove(farLeft, farRight)
    expect(control.getAttribute('data-state')).toBe('checked')
    expect(emitted('update:modelValue')).toBeUndefined()

    await commands.mouseUp()
    expect(emitted('update:modelValue')).toEqual([[true]])
  })

  it('moves and commits ON to OFF once', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      props: { defaultValue: true },
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const { thumb, farLeft } = geometry(control)

    await gesture(thumb, farLeft)
    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toEqual([[false]])
  })

  it('springs back with no emit when released on the current side', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const thumbEl = control.parentElement!.querySelector<HTMLElement>(
      '.macvue-switch-thumb',
    )!
    const { thumb, sameLeft } = geometry(control)

    await commands.mouseDown(thumb)
    await commands.mouseMove(thumb, sameLeft)
    expect(thumbEl.style.transform).not.toBe('')
    await commands.mouseUp()

    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(thumbEl.style.transform).toBe('')
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('handles an ordinary pointer click once and classifies its click as pointer-originated', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const clicks: Array<Record<string, unknown>> = []
    control.addEventListener('click', (event) => {
      const pointer = event as PointerEvent
      clicks.push({
        constructor: event.constructor.name,
        detail: event.detail,
        pointerType: pointer.pointerType,
        pointerId: pointer.pointerId,
      })
    })
    const { thumb } = geometry(control)

    await commands.mouseDown(thumb)
    await commands.mouseUp()

    expect(control.getAttribute('data-state')).toBe('checked')
    expect(emitted('update:modelValue')).toEqual([[true]])
    expect(clicks).toEqual([
      {
        constructor: 'PointerEvent',
        detail: 1,
        pointerType: 'mouse',
        pointerId: 1,
      },
    ])
  })

  it('keeps the knob in place until an opposite-side click is released', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      props: { defaultValue: true },
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const thumbEl = control.parentElement!.querySelector<HTMLElement>(
      '.macvue-switch-thumb',
    )!
    const { farLeft } = geometry(control)

    await commands.mouseDown(farLeft)
    expect(control.getAttribute('data-state')).toBe('checked')
    expect(thumbEl.style.transform).toMatch(/^translateX\([\d.]+px\)$/)
    expect(emitted('update:modelValue')).toBeUndefined()

    await commands.mouseUp()
    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toEqual([[false]])
  })

  it('toggles from the caption without a label-forwarded control click', async () => {
    const { getByRole, getByText, emitted } = render(MacSwitch, {
      slots: { default: () => 'Wi-Fi' },
    })
    const control = getByRole('slider')
    let controlClicks = 0
    control.addEventListener('click', () => (controlClicks += 1))
    const caption = getByText('Wi-Fi').getBoundingClientRect()
    const at = {
      x: caption.x + caption.width / 2,
      y: caption.y + caption.height / 2,
    }

    await commands.mouseDown(at)
    await commands.mouseUp()

    expect(control.getAttribute('data-state')).toBe('checked')
    expect(emitted('update:modelValue')).toEqual([[true]])
    expect(controlClicks).toBe(0)
  })

  it('toggles from Space and Enter without a pointer gesture', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    control.focus()

    await commands.keyPress('Space')
    expect(control.getAttribute('data-state')).toBe('checked')
    await commands.keyPress('Enter')
    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('allows an immediate legitimate click after a completed drag', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const { thumb, farRight } = geometry(control)

    await gesture(thumb, farRight)
    const onThumb = geometry(control).thumb
    await commands.mouseDown(onThumb)
    await commands.mouseUp()

    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toEqual([[true], [false]])
  })

  it('cancels a drag on Escape without an emit', async () => {
    const { getByRole, emitted } = render(MacSwitch, {
      attrs: { 'aria-label': 'Wi-Fi' },
    })
    const control = getByRole('slider')
    const thumbEl = control.parentElement!.querySelector<HTMLElement>(
      '.macvue-switch-thumb',
    )!
    const { thumb, farRight } = geometry(control)

    await commands.mouseDown(thumb)
    await commands.mouseMove(thumb, farRight)
    control.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    )
    await nextTick()
    expect(thumbEl.style.transform).toBe('')
    await commands.mouseUp()

    expect(control.getAttribute('data-state')).toBe('unchecked')
    expect(emitted('update:modelValue')).toBeUndefined()
  })

  it('participates in native form submission and required validation', async () => {
    const { container, getByRole } = render({
      render() {
        return h('form', [
          h(
            MacSwitch,
            { name: 'wifi', value: 'enabled', required: true },
            () => 'Wi-Fi',
          ),
        ])
      },
    })
    const form = container.querySelector('form')!
    const input = container.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    )!
    const control = getByRole('slider')

    expect(input.checked).toBe(false)
    expect(input.required).toBe(true)
    expect(input.disabled).toBe(false)
    expect(input.tabIndex).toBe(-1)
    expect(input.getAttribute('aria-hidden')).toBe('true')
    expect(form.checkValidity()).toBe(false)
    expect(new FormData(form).get('wifi')).toBeNull()

    const { thumb } = geometry(control)
    await commands.mouseDown(thumb)
    await commands.mouseUp()

    expect(input.checked).toBe(true)
    expect(form.checkValidity()).toBe(true)
    expect(new FormData(form).get('wifi')).toBe('enabled')
  })
})
