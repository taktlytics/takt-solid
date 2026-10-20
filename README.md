<div align="center">

# @vskstudio/takt-solid


> 📚 **Documentation**: [taktlytics.com/docs/wrappers/solid](https://taktlytics.com/docs/wrappers/solid)

**Idiomatic SolidJS wrapper for [Takt](https://github.com/taktlytics/takt-core) privacy-friendly analytics.**

[![npm version](https://img.shields.io/npm/v/@vskstudio/takt-solid?color=2c4f7c&logo=npm)](https://www.npmjs.com/package/@vskstudio/takt-solid)
[![solid 1.8+](https://img.shields.io/badge/solid-1.8%2B-2c4f7c?logo=solid&logoColor=fff)](https://www.solidjs.com)
[![license](https://img.shields.io/npm/l/@vskstudio/takt-solid?color=2c4f7c)](./LICENSE)

</div>

---

A thin, SSR-safe Solid layer over [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core). It never changes the wire payload or the privacy guarantees. It just makes Takt feel native in a Solid app.

- **`<Takt>` component**: drop it once near the root; it boots analytics in `onMount` and provides the instance to the tree.
- **`useTakt()`**: resolve the live instance at call time, anywhere; returns a never-throwing no-op before mount or during SSR.
- **`createTaktEvent()` & `<TaktEvent>`**: declarative click tracking.
- **`<takt-analytics>` custom element**: framework-agnostic, Solid-free embed for non-Solid pages.

## Install

```bash
pnpm add @vskstudio/takt-solid @vskstudio/takt-core
```

`solid-js` (`^1.8`) and `@vskstudio/takt-core` (`>=0.10.0`) are peer dependencies.

## Quick start: provider + accessor

Mount `<Takt>` once near your root. It fires an initial pageview, wires SPA navigation, and provides the instance to every descendant:

```tsx
import { Takt } from '@vskstudio/takt-solid'

export function App() {
  return (
    <Takt domain="example.com" outbound files={['pdf', 'zip']}>
      <Routes />
    </Takt>
  )
}
```

Then track custom events from any descendant:

```tsx
import { useTakt } from '@vskstudio/takt-solid'

export function SignupButton() {
  return (
    <button
      onClick={() =>
        // Resolve at click time: `<Takt>` boots in onMount, so a call in the
        // component body would capture (and keep) the pre-mount no-op.
        useTakt().track('Signup', {
          props: { plan: 'pro' },
          revenue: { amount: '29.00', currency: 'EUR' },
        })
      }
    >
      Sign up
    </button>
  )
}
```

`useTakt()` resolves the instance **at call time** and always returns something usable: before `<Takt>` mounts (or during SSR) it hands back a never-throwing no-op, so your handlers never crash. Call it inside the handler, or inside `onMount`/`createEffect` if you need to hold on to it. Never at the top of the component body, where the returned value would be the no-op forever.

## `<Takt>` props

| Prop               | Type                  | Default              | Description                                                     |
| ------------------ | --------------------- | -------------------- | -------------------------------------------------------------- |
| `domain`           | `string`              | `location.hostname`  | Site identifier sent with every event.                         |
| `endpoint`         | `string`              | `https://taktlytics.com/api/event` | Ingestion endpoint. Pass `/api/event` for a same-origin first-party proxy. |
| `scriptOrigin`     | `string`              | n/a | First-party origin to derive the endpoint from (`{origin}/api/event`): your Takt domain or a custom domain to dodge ad-blockers (endpoint wins over it). |
| `outbound`         | `boolean`             | `false`              | Auto-track outbound link clicks.                               |
| `files`            | `boolean \| string[]` | `false`              | Auto-track file downloads; pass extensions to restrict.        |
| `spa`              | `boolean`             | `true`               | Track SPA navigations (pushState/replaceState + popstate).     |
| `track404`         | `boolean`             | `false`              | Report a `404` event when the page is an error page (`[data-takt-404]` / `<meta name="takt:404">` marker, or a 404 HTTP status). |
| `respectDnt`       | `boolean`             | `true`               | Suppress events when the browser's Do Not Track is enabled.    |
| `excludeLocalhost` | `boolean`             | `true`               | Suppress events on localhost and private IP ranges.            |
| `enabled`          | `boolean`             | `true`               | Master switch: set to `false` to fully disable tracking.      |
| `sampleRate`       | `number`              | `1`                  | Fraction of sessions to track (0 to 1).                           |
| `trackQuery`       | `boolean`             | `false`              | Include the query string in page URLs.                         |
| `queryParams`      | `string[]`            | n/a | Query parameters to keep when `trackQuery` is false.           |
| `exclude`          | `string[]`            | n/a | Path prefixes never tracked, e.g. `['/app', '/account']`. Segment-bounded, case-insensitive, blind to a trailing slash and to percent-encoding (`/admin` excludes `/%61dmin`), checked at send time. |
| `scrubUrl`         | `(url: string) => string` | n/a | Transform URLs before they are sent (page, referrer, and the `url` prop of outbound-link and file-download events). Function prop: config only, not available as a custom-element attribute. |
| `tagged`           | `boolean`             | `false`              | Auto-track `[data-takt-event]` element clicks; props are read from `data-takt-prop-*` attributes. |
| `redactRoutes`     | `string[]`            | n/a | Route patterns sent as the pattern instead of the real path, e.g. `['/verify/:token']`. See [Route redaction](#route-redaction). |
| `redactUndecodablePaths` | `boolean`       | `true`               | When a route is configured, a path that cannot be decoded is sent as `/[redacted]`. `false` decodes it leniently and still matches it, as takt-core-php does. |
| `routeTemplates`   | `boolean`             | `false`              | Send every page as its route template (`/blog/:slug`). Needs `routeTemplate`. |
| `routeTemplate`    | `() => string \| null \| undefined` | n/a | Returns the current route template. Use `solidRouterTemplate(useCurrentMatches())` with `@solidjs/router`. |
| `debug`            | `boolean`             | `false`              | Log each payload to the console before sending.                |

> Config props are read once when `<Takt>` mounts. Changing them afterwards has no effect, so remount the component to reconfigure. `routeTemplate` is the exception: it is read on every pageview.

## Route redaction

Query strings are stripped by default, but path segments are sent as they are: `/verify/abc123` leaks the token. `redactRoutes` lists the sensitive routes; a matching path is sent as the pattern and every other path keeps its real value.

```tsx
<Takt domain="example.com" redactRoutes={['/verify/:token', '/reset/:code', '/invoices/:id']}>
  <App />
</Takt>
```

Patterns accept Solid Router syntax (`:param`, `:param?`, `*rest`), SvelteKit / Astro / Next syntax (`[param]`, `[[optional]]`, `[...rest]`, `(group)`), `*` and `**`, and the braces of takt-core-php (`{param}`, `{param?}`, `{param<regex>}`). The rule covers the page URL, same-origin referrers, outbound and download link destinations, and 404 paths.

A brace parameter can carry a `<regex>` constraint, for example `{id<\d+>}`, which only matches a segment satisfying it. The constraint must follow a closed grammar (printable ASCII, literals, `.`, `\d \D \w \W \s \S`, classes, top-level alternation and bounded quantifiers) and a route stays within size and ambiguity bounds. A constraint outside that grammar, or a route over those bounds, is unusable: every path it would match is masked as `/[redacted]` rather than sent raw.

A path that cannot be decoded (a malformed `%` escape or invalid UTF-8) is masked as `/[redacted]` as soon as a route is configured. Set `redactUndecodablePaths={false}` to decode it leniently instead, keeping an invalid escape as written and still matching the routes. A path that still changes after five decoding passes is always masked. When a path is masked, its query string and fragment are dropped too.

For a fully private app, `routeTemplates` sends every page as its route template: `/blog/hello` becomes `/blog/:slug`. In that template mode, downloads are always sent as `/[redacted]`, whatever their host, and every referrer is reduced to its origin. Outside it, a download path is masked only by `redactRoutes`. With `@solidjs/router`, call `useCurrentMatches()` in a component rendered under the router and hand it to `solidRouterTemplate()`, which returns the `pattern` of the deepest matched route:

```tsx
import { Router, Route, useCurrentMatches, type RouteSectionProps } from '@solidjs/router'
import { Takt, solidRouterTemplate } from '@vskstudio/takt-solid'

function Layout(props: RouteSectionProps) {
  const matches = useCurrentMatches()
  return (
    <Takt domain="example.com" routeTemplates routeTemplate={solidRouterTemplate(matches)}>
      {props.children}
    </Takt>
  )
}

export function App() {
  return (
    <Router root={Layout}>
      <Route path="/" component={Home} />
      <Route path="/blog/:slug" component={Post} />
    </Router>
  )
}
```

`solidRouterTemplate` only needs an accessor returning `{ route: { pattern } }[]`, so the package does not depend on `@solidjs/router`. When the resolver returns nothing, `redactRoutes` still applies and `/[redacted]` is sent otherwise, without query or hash. On a public site this mode merges every article into one row, so prefer `redactRoutes` there.

## Declarative click tracking

Two equivalent ways to track a click without writing a handler.

**`createTaktEvent()`** returns an `{ onClick }` you spread onto any element:

```tsx
import { createTaktEvent } from '@vskstudio/takt-solid'

export function BuyButton() {
  const onBuy = createTaktEvent({ name: 'Buy', revenue: { amount: '9.00', currency: 'EUR' } })
  return <button {...onBuy}>Buy</button>
}
```

**`<TaktEvent>`** wraps a single child and composes its existing `onClick`:

```tsx
import { TaktEvent } from '@vskstudio/takt-solid'

export function SignupCta(props: { onClick: () => void }) {
  return (
    <TaktEvent name="Signup" props={{ plan: 'pro' }}>
      <button onClick={props.onClick}>Sign up</button>
    </TaktEvent>
  )
}
```

Both resolve the active instance at click time, so they work inside `<Takt>` or with an `init()`-driven core setup, falling back to core's default instance otherwise.

## Custom element (Solid-free)

For non-Solid pages, import the side-effecting `./element` entry to register `<takt-analytics>`. It bundles core and pulls in **no Solid runtime**:

```ts
import '@vskstudio/takt-solid/element'
```

```html
<takt-analytics domain="example.com" outbound files></takt-analytics>
```

| Attribute          | Kind          | Notes                                                          |
| ------------------ | ------------- | -------------------------------------------------------------- |
| `domain`           | value         | Site identifier.                                                |
| `endpoint`         | value         | Ingestion endpoint.                                             |
| `script-origin`    | value         | First-party origin to derive the endpoint from.                 |
| `sample-rate`      | value         | Fraction of sessions to track (0 to 1); ignored if not a number.   |
| `query-params`     | value         | Comma-separated list of query parameters to keep.               |
| `exclude`          | value         | Comma-separated path prefixes never tracked.                    |
| `redact-routes`    | value         | Comma-separated route patterns sent as the pattern, e.g. `/verify/:token, /reset/:code`. |
| `redact-undecodable-paths` | value | Set to `"false"` or `"0"` to decode undecodable paths leniently; any other value keeps the masking. |
| `file-extensions`  | value         | Comma-separated extensions tracked as downloads; applies only with `files`, which otherwise uses the default list. |
| `respect-dnt`      | default-on    | Disabled only by `"false"`/`"0"`.                               |
| `exclude-localhost`| default-on    | Disabled only by `"false"`/`"0"`.                               |
| `spa`              | default-on    | Disabled only by `"false"`/`"0"`.                               |
| `track-query`      | opt-in value  | Applied only when the attribute is present; `"false"`/`"0"` turns it off. |
| `enabled`          | opt-in value  | Applied only when the attribute is present; `"false"`/`"0"` disables tracking. |
| `outbound`         | presence flag | Auto-track outbound link clicks.                                |
| `files`            | presence flag | Auto-track file downloads (all default extensions).             |
| `track-404`        | presence flag | Report a `404` event on error pages.                            |
| `tagged`           | presence flag | Auto-track `[data-takt-event]` element clicks.                  |
| `debug`            | opt-in value  | Applied only when the attribute is present; logs each payload.  |

Privacy attributes are on by default and only disabled by an explicit `"false"`/`"0"`; presence flags activate when the attribute exists at all. `scrubUrl` is a function prop and has no attribute equivalent. `routeTemplates` has none either, since the element has no router.

## SSR

`<Takt>` boots inside `onMount` and is guarded by Solid's `isServer`, so nothing touches `window`/`document` on the server. `useTakt()` returns the no-op during the server pass. Importing `@vskstudio/takt-solid/element` on the server is a no-op: registration is guarded behind a `customElements` check.

## Privacy

All privacy behavior lives in [`@vskstudio/takt-core`](https://www.npmjs.com/package/@vskstudio/takt-core): Do Not Track support, localhost exclusion, opt-in/opt-out consent, and a frozen wire payload. This wrapper never alters any of it.

Consent works before `<Takt>` has mounted: `useTakt().optOut()`, `useTakt().optIn()` and `useTakt().isOptedOut()` go straight to the stored choice, and so do the `optOut`, `optIn` and `isOptedOut` functions exported by the package. A consent banner can therefore render first, and the instance created later honours the choice.

```tsx
import { createSignal } from 'solid-js'
import { isOptedOut, optIn, optOut } from '@vskstudio/takt-solid'

function AnalyticsToggle() {
  const [blocked, setBlocked] = createSignal(isOptedOut())
  const toggle = () => {
    blocked() ? optIn() : optOut()
    setBlocked(isOptedOut())
  }
  return <button onClick={toggle}>{blocked() ? 'Enable analytics' : 'Disable analytics'}</button>
}
```

## Widgets

Thin wrappers over the server-rendered badge SVG and embed page. `<TaktBadge>` renders an `<img>`, `<TaktEmbed>` an `<iframe>`; both accept native passthrough props.

```tsx
import { TaktBadge, TaktEmbed } from '@vskstudio/takt-solid'

;<TaktBadge domain="example.com" variant="d" glyph="dash" />
;<TaktEmbed domain="example.com" theme="dark" />
```

The embed `<iframe>` is hardened: it ships with `sandbox="allow-scripts allow-same-origin"` and a fixed `referrerpolicy="strict-origin-when-cross-origin"`, both wrapper-controlled and not overridable. The badge `alt` defaults to `"takt"` but can be overridden via passthrough. The optional `host` prop must be an absolute `http(s)` URL (validated by core, which reduces it to its origin); `src` is wrapper-controlled and cannot be overridden.

For programmatic stats, `createStats` returns a typed public-API client:

```ts
import { createStats } from '@vskstudio/takt-solid'

const stats = createStats({ domain: 'example.com' })
const summary = await stats.summary({ period: '7d' })
```

The package also re-exports `badgeUrl`, `embedUrl`, `PublicApiError`, `optOut`, `optIn` and `isOptedOut` from core, along with the widget and stats types, so you never need a direct import from `@vskstudio/takt-core` for them.

## License

[MIT](./LICENSE)
