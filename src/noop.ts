import { optOut, optIn, isOptedOut, type createTakt } from '@vskstudio/takt-core'

// Public structural surface of core's Analytics. Picking the public methods
// drops the class's private members, which otherwise make the emitted .d.ts
// for context/store values invalid (TS4094).
export type TaktInstance = Pick<
  ReturnType<typeof createTakt>,
  | 'track'
  | 'pageview'
  | 'enableSpa'
  | 'enableOutbound'
  | 'enableFiles'
  | 'enable404'
  | 'enableTagged'
  | 'optOut'
  | 'optIn'
  | 'isOptedOut'
>

let _noop: TaktInstance | null = null
let _warned = false

export function noopTakt(): TaktInstance {
  if (_noop) return _noop
  const warnOnce = (): void => {
    if (_warned) return
    _warned = true
    console.warn('[takt] useTakt() called before <Takt> mounted — returning a no-op instance.')
  }
  const noDispose = (): (() => void) => () => {}
  const track: TaktInstance['track'] = () => warnOnce()
  _noop = {
    track,
    pageview: () => warnOnce(),
    enableSpa: noDispose,
    enableOutbound: noDispose,
    enableFiles: noDispose,
    enable404: noDispose,
    enableTagged: noDispose,
    optOut,
    optIn,
    isOptedOut,
  }
  return _noop
}
