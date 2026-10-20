import { describe, it, expect } from 'vitest'
import * as api from '../src/index'
import type { Payload, RouteTemplateResolver, TrackOptions } from '../src/index'

describe('public API surface', () => {
  it('exports the documented members', () => {
    expect(typeof api.Takt).toBe('function')
    expect(typeof api.useTakt).toBe('function')
    expect(typeof api.createTaktEvent).toBe('function')
    expect(typeof api.TaktEvent).toBe('function')
    expect(typeof api.optOut).toBe('function')
    expect(typeof api.optIn).toBe('function')
    expect(typeof api.isOptedOut).toBe('function')
  })

  it('re-exports the core helpers added in takt-core 0.12', () => {
    expect(api.normalizeHost('https://cdn.example.com/')).toBe('https://cdn.example.com')
    expect(typeof api.normalizeHost).toBe('function')
  })

  it('re-exports the core option and payload types', () => {
    const resolver: RouteTemplateResolver = () => '/blog/[slug]'
    const options: TrackOptions = { props: { plan: 'pro' } }
    const payload = { n: 'pageview' } as Partial<Payload>
    expect(resolver()).toBe('/blog/[slug]')
    expect(options.props).toEqual({ plan: 'pro' })
    expect(payload.n).toBe('pageview')
  })
})
