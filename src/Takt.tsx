import { createSignal, onCleanup, onMount, type JSX } from 'solid-js'
import { isServer } from 'solid-js/web'
import { createTakt } from '@vskstudio/takt-core'
import { TaktContext, taktStore, type TaktChannel, type TaktInstance } from './store'

export interface TaktProps {
  /** Site identifier sent with every event. Defaults to `location.hostname`. */
  domain?: string
  /** Ingestion endpoint. Defaults to `https://taktlytics.com/api/event` (the hosted Takt origin); pass `/api/event` for a same-origin first-party proxy. */
  endpoint?: string
  /** First-party origin to derive the endpoint from (`{origin}/api/event`) — a custom domain you proxy through to dodge ad-blockers (endpoint wins over it). */
  scriptOrigin?: string
  /** Auto-track outbound link clicks. */
  outbound?: boolean
  /** Auto-track file downloads. Pass an array to restrict to those extensions. */
  files?: boolean | string[]
  /** Track SPA navigations (history pushState/replaceState + popstate). */
  spa?: boolean
  /** Report a `404` event when the page is an error page (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status). */
  track404?: boolean
  /** Suppress events when the browser's Do Not Track is enabled. */
  respectDnt?: boolean
  /** Suppress events on localhost and private IP ranges. */
  excludeLocalhost?: boolean
  /** Master switch — set to `false` to fully disable tracking. */
  enabled?: boolean
  /** Fraction of sessions to track (0–1). */
  sampleRate?: number
  /** Include the query string in page URLs. */
  trackQuery?: boolean
  /** Query parameters to keep when `trackQuery` is false. */
  queryParams?: string[]
  /** Path prefixes never tracked, e.g. `['/app','/account']`. Segment-bounded: `'/app'` matches `'/app'` and `'/app/…'` but not `'/application'`. */
  exclude?: string[]
  /** Transform page URLs before they are sent (dev-controlled function, config only). */
  scrubUrl?: (url: string) => string
  /** Auto-track `[data-takt-event]` element clicks (props read from `data-takt-prop-*`). */
  tagged?: boolean
  debug?: boolean
  children?: JSX.Element
}

export function Takt(props: TaktProps): JSX.Element {
  const [instance, setInstance] = createSignal<TaktInstance | null>(null)
  // Objet stable : c'est lui que le contexte fige, l'accesseur reste vivant.
  const channel: TaktChannel = { instance }

  onMount(() => {
    // Never boot on the server: createTakt touches location/window.
    if (isServer) return
    const takt = createTakt({
      domain: props.domain,
      endpoint: props.endpoint,
      scriptOrigin: props.scriptOrigin,
      respectDnt: props.respectDnt ?? true,
      excludeLocalhost: props.excludeLocalhost ?? true,
      enabled: props.enabled,
      sampleRate: props.sampleRate,
      trackQuery: props.trackQuery,
      queryParams: props.queryParams,
      exclude: props.exclude,
      scrubUrl: props.scrubUrl,
      debug: props.debug,
    })
    const disposers: Array<() => void> = []
    if (props.spa ?? true) disposers.push(takt.enableSpa())
    if (props.outbound) disposers.push(takt.enableOutbound())
    if (props.files) disposers.push(takt.enableFiles(Array.isArray(props.files) ? props.files : undefined))
    if (props.track404) disposers.push(takt.enable404())
    if (props.tagged) disposers.push(takt.enableTagged())
    takt.pageview()

    setInstance(takt)
    taktStore.value = takt

    onCleanup(() => {
      disposers.forEach((dispose) => dispose())
      setInstance(null)
      // Ne pas effacer le repli publié par un autre <Takt> encore monté.
      if (taktStore.value === takt) taktStore.value = null
    })
  })

  return <TaktContext.Provider value={channel}>{props.children}</TaktContext.Provider>
}
