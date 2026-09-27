import { describe, it, expect } from 'vitest'
import * as api from '../src/index'

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
})
