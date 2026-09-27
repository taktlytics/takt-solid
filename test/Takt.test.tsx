import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@solidjs/testing-library'
import { getOwner, runWithOwner } from 'solid-js'

const { enableSpa, enableOutbound, enableFiles, enable404, enableTagged, pageview, createTakt } = vi.hoisted(() => {
  const enableSpa = vi.fn(() => vi.fn())
  const enableOutbound = vi.fn(() => vi.fn())
  const enableFiles = vi.fn(() => vi.fn())
  const enable404 = vi.fn(() => vi.fn())
  const enableTagged = vi.fn(() => vi.fn())
  const pageview = vi.fn()
  const createTakt = vi.fn(() => ({ enableSpa, enableOutbound, enableFiles, enable404, enableTagged, pageview, track: vi.fn() }))
  return { enableSpa, enableOutbound, enableFiles, enable404, enableTagged, pageview, createTakt }
})

vi.mock('@vskstudio/takt-core', () => ({ createTakt, optOut: vi.fn(), optIn: vi.fn(), isOptedOut: vi.fn(() => false) }))

import { Takt } from '../src/Takt'
import { useTakt } from '../src/useTakt'
import { taktStore, type TaktInstance } from '../src/store'

beforeEach(() => {
  vi.clearAllMocks()
  taktStore.value = null
})

const makeInstance = () => ({ enableSpa, enableOutbound, enableFiles, enable404, enableTagged, pageview, track: vi.fn() })

// Capture l'owner du descendant pour rejouer useTakt() après le montage,
// comme le ferait un gestionnaire de clic, sans effet de contournement.
const readers: Record<string, () => TaktInstance | undefined> = {}

function Reader(props: { id: string }) {
  const owner = getOwner()
  readers[props.id] = () => runWithOwner(owner, () => useTakt())
  return null
}

describe('<Takt>', () => {
  it('boots on mount: createTakt + spa + pageview, publishes to the store', () => {
    render(() => <Takt domain="example.com">child</Takt>)
    expect(createTakt).toHaveBeenCalledOnce()
    expect(enableSpa).toHaveBeenCalledOnce()
    expect(pageview).toHaveBeenCalledOnce()
    expect(taktStore.value).not.toBeNull()
  })

  it('honors feature toggles and disposes on unmount', () => {
    const disposeSpa = vi.fn()
    const disposeOutbound = vi.fn()
    enableSpa.mockReturnValueOnce(disposeSpa)
    enableOutbound.mockReturnValueOnce(disposeOutbound)
    const { unmount } = render(() => (
      <Takt outbound files={['pdf']}>
        x
      </Takt>
    ))
    expect(enableOutbound).toHaveBeenCalledOnce()
    expect(enableFiles).toHaveBeenCalledWith(['pdf'])
    expect(disposeSpa).not.toHaveBeenCalled()
    expect(disposeOutbound).not.toHaveBeenCalled()
    unmount()
    expect(disposeSpa).toHaveBeenCalledOnce()
    expect(disposeOutbound).toHaveBeenCalledOnce()
    expect(taktStore.value).toBeNull()
  })

  it('does not enable spa when spa={false}', () => {
    render(() => <Takt spa={false}>x</Takt>)
    expect(enableSpa).not.toHaveBeenCalled()
  })

  it('enables 404 only when track404 is set', () => {
    render(() => <Takt>x</Takt>)
    expect(enable404).not.toHaveBeenCalled()
    render(() => <Takt track404>x</Takt>)
    expect(enable404).toHaveBeenCalledOnce()
  })

  it('enables tagged when tagged prop is set and disposes on unmount', () => {
    const disposeTagged = vi.fn()
    enableTagged.mockReturnValueOnce(disposeTagged)
    const { unmount } = render(() => <Takt domain="example.com" tagged>x</Takt>)
    expect(enableTagged).toHaveBeenCalledOnce()
    expect(disposeTagged).not.toHaveBeenCalled()
    unmount()
    expect(disposeTagged).toHaveBeenCalledOnce()
  })

  it('forwards debug to createTakt', () => {
    render(() => <Takt debug>x</Takt>)
    expect(createTakt).toHaveBeenCalledWith(expect.objectContaining({ debug: true }))
  })

  it('forwards scriptOrigin to createTakt', () => {
    render(() => <Takt scriptOrigin="https://t.example.com">x</Takt>)
    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ scriptOrigin: 'https://t.example.com' }),
    )
  })

  it('passes privacy defaults through to createTakt', () => {
    render(() => <Takt respectDnt={false}>x</Takt>)
    expect(createTakt).toHaveBeenCalledWith(
      expect.objectContaining({ respectDnt: false, excludeLocalhost: true }),
    )
  })

  it('provides the live instance via context to useTakt()', () => {
    const created = makeInstance()
    createTakt.mockReturnValueOnce(created)
    render(() => (
      <Takt>
        <Reader id="solo" />
      </Takt>
    ))
    // Le repli hors arbre est neutralisé : seul le contexte peut répondre.
    taktStore.value = null
    expect(readers.solo()).toBe(created)
  })

  it('gives sibling <Takt> subtrees their own instance', () => {
    const first = makeInstance()
    const second = makeInstance()
    createTakt.mockReturnValueOnce(first).mockReturnValueOnce(second)
    render(() => (
      <>
        <Takt domain="first.example">
          <Reader id="first" />
        </Takt>
        <Takt domain="second.example">
          <Reader id="second" />
        </Takt>
      </>
    ))
    expect(readers.first()).toBe(first)
    expect(readers.second()).toBe(second)
  })

  it('gives a nested <Takt> subtree the innermost instance', () => {
    const outer = makeInstance()
    const inner = makeInstance()
    createTakt.mockReturnValueOnce(outer).mockReturnValueOnce(inner)
    render(() => (
      <Takt domain="outer.example">
        <Reader id="outer" />
        <Takt domain="inner.example">
          <Reader id="inner" />
        </Takt>
      </Takt>
    ))
    expect(readers.outer()).toBe(outer)
    expect(readers.inner()).toBe(inner)
  })

  it('falls back to the no-op once the subtree is unmounted', () => {
    const created = makeInstance()
    createTakt.mockReturnValueOnce(created)
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const { unmount } = render(() => (
      <Takt>
        <Reader id="gone" />
      </Takt>
    ))
    unmount()
    expect(readers.gone()).not.toBe(created)
  })
})
