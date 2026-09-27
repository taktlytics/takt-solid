import { describe, it, expect } from 'vitest'
import { createSignal } from 'solid-js'
import { solidRouterTemplate } from '../src/solidRouterTemplate'
import * as api from '../src/index'

describe('solidRouterTemplate', () => {
  it('returns the pattern of the deepest match', () => {
    const matches = () => [{ route: { pattern: '/blog' } }, { route: { pattern: '/blog/:slug' } }]
    expect(solidRouterTemplate(matches)()).toBe('/blog/:slug')
  })

  it('returns null when nothing matches', () => {
    expect(solidRouterTemplate(() => [])()).toBeNull()
  })

  it('reads the matches accessor on every call', () => {
    const [matches, setMatches] = createSignal([{ route: { pattern: '/' } }])
    const resolve = solidRouterTemplate(matches)
    expect(resolve()).toBe('/')
    setMatches([{ route: { pattern: '/users/:id' } }])
    expect(resolve()).toBe('/users/:id')
  })

  it('is exported from the package entry', () => {
    expect(api.solidRouterTemplate).toBe(solidRouterTemplate)
  })
})
