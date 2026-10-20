# @vskstudio/takt-solid

## 0.10.2

### Patch Changes

- 39fae4e: Ships `@vskstudio/takt-core` 0.12.3, which stops the `takt.auto.js` bundle from overwriting `window.takt`. The Solid wrapper does not load that bundle, so its runtime is unchanged. The `@vskstudio/takt-core` peer range is raised to `>=0.12.3`.

## 0.10.1

### Patch Changes

- c8569e8: Embarque takt-core 0.12.2 : liste unique de 21 extensions de téléchargement.

## 0.10.0

### Minor Changes

- dc97feb: Expose the takt-core 0.12 options. `<Takt>` gains `redactUndecodablePaths`, and `<takt-analytics>` gains the `redact-undecodable-paths` and `file-extensions` attributes. `normalizeHost` and the `Payload`, `RouteTemplateResolver` and `TrackOptions` types are re-exported. The peer dependency moves to `@vskstudio/takt-core` `>=0.12.1`, since these options need that core. Minor, because the new options are additive.

## 0.9.1

### Patch Changes

- Published to npm through Trusted Publishing (OIDC) instead of a long-lived token. No runtime change.

## 0.9.0

### Minor Changes

- Requires `@vskstudio/takt-core` 0.11.0 or later, and the self-contained `/element` build now bundles it: route redaction applies to outbound-link and file-download destinations and to the `404` path, `exclude` matches case-insensitively on the percent-decoded path, and the server client refuses a plain `http://` endpoint outside localhost.

## 0.8.0

### Minor Changes

- c8925bd: New `redactRoutes`, `routeTemplates` and `routeTemplate` props on `<Takt>`, forwarded to `createTakt`, and a `redact-routes` attribute on `<takt-analytics>`. `redactRoutes` sends sensitive paths such as `/verify/abc123` as their pattern (`/verify/:token`). `routeTemplates` sends every page as its route template, and the new `solidRouterTemplate(useCurrentMatches())` helper resolves it from `@solidjs/router` without depending on it. Requires `@vskstudio/takt-core` 0.10.0.

## 0.7.0

### Minor Changes

- 46520aa: New `debug` prop on `<Takt>` and `debug` attribute on `<takt-analytics>`. `useTakt().optOut()`, `optIn()` and the new `isOptedOut()` work before `<Takt>` mounts, and the package re-exports `optOut`, `optIn` and `isOptedOut` from core. Requires `@vskstudio/takt-core` 0.9.0, where `scrubUrl` also covers outbound-link and file-download URLs.

## 0.6.2

### Patch Changes

- Fix the context channel: Solid's provider reads `props.value` untracked, so the context value stayed frozen on the pre-mount `null` and every descendant silently fell back to the module singleton, which also made two `<Takt>` on the same page overwrite each other. The context now carries a stable channel holding the instance accessor; `useTakt()` keeps returning a `TaktInstance` and each subtree resolves its own instance. Unmounting one `<Takt>` no longer clears the fallback published by another still-mounted one.
- Add `enableTagged` to `TaktInstance` and to the no-op instance: `<Takt tagged>` calls it, so calling it on a no-op threw a `TypeError` instead of being inert.
- Docs: the default endpoint is `https://taktlytics.com/api/event` (pass `/api/event` explicitly for a same-origin first-party proxy), `useTakt()` must be resolved at click time rather than captured in the component body, and tagged autocapture targets `[data-takt-event]` / `data-takt-prop-*` (not `[data-takt-tag]`). Also documents the custom-element attributes and the `@vskstudio/takt-core` `>=0.8.1` peer bound.

## 0.5.1

### Patch Changes

- Require takt-core >=0.6.0, whose default ingest endpoint and stats/widget host are now the hosted Takt origin (https://taktlytics.com). Docs updated to match; no wrapper code change.

## 0.5.0

### Minor Changes

- ff9a047: Expose advanced tracker options: enabled, sampleRate, trackQuery, queryParams,
  scrubUrl (function prop / config only) and tagged. Peer dep raised to takt-core >=0.5.0.

## 0.3.1

### Patch Changes

- Harden widgets: `Omit` the wrapper-controlled `src` from the badge/embed prop types, add `decoding="async"` to the badge for parity, keep `src` rendered after the prop spread so a consumer `src` cannot override the built URL, and add a default `referrerpolicy="strict-origin-when-cross-origin"` to `<TaktEmbed>` (overridable). Document that `host` must be an absolute http(s) URL.

## 0.3.0

### Minor Changes

- Add native `TaktBadge` and `TaktEmbed` widget components and re-export the public stats client (`createStats`) and widget URL builders from `@vskstudio/takt-core`. Requires `@vskstudio/takt-core` >= 0.3.0.

## 0.2.0

### Minor Changes

- Initial release: idiomatic SolidJS wrapper for Takt analytics.
  - `<Takt>` provider component (SSR-safe boot in `onMount`, guarded by `isServer`).
  - `useTakt()` accessor with a never-throwing no-op fallback.
  - `createTaktEvent()` and `<TaktEvent>` for declarative click tracking, resolving
    the active instance (and reading `props`/`revenue`) at click time, with a core
    `track` fallback for `init()`-driven setups.
  - Framework-agnostic `<takt-analytics>` custom element via `./element`.
  - Aligned with `@vskstudio/takt-core` 0.2 (`props` and `revenue` flow through).
