import { children, onCleanup, onMount, type JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { createTaktEvent, type TaktEventParams } from './createTaktEvent'

/**
 * Declarative click tracking around a single child element:
 * `<TaktEvent name="Signup"><button>…</button></TaktEvent>`. Tracks through the
 * active instance on click, composing (not replacing) any handler already on the
 * child, the child's own `onClick` keeps firing.
 */
export function TaktEvent(props: TaktEventParams & { children: JSX.Element }): JSX.Element {
  const { onClick } = createTaktEvent(props)
  const resolved = children(() => props.children)

  onMount(() => {
    if (isServer) return
    const node = resolved()
    if (!(node instanceof Element)) {
      console.warn('[takt] <TaktEvent> expects a single element child; tracking is disabled.')
      return
    }
    const handler = (): void => onClick()
    node.addEventListener('click', handler)
    onCleanup(() => node.removeEventListener('click', handler))
  })

  return <>{resolved()}</>
}
