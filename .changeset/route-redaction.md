---
'@vskstudio/takt-solid': minor
---

New `redactRoutes`, `routeTemplates` and `routeTemplate` props on `<Takt>`, forwarded to `createTakt`, and a `redact-routes` attribute on `<takt-analytics>`. `redactRoutes` sends sensitive paths such as `/verify/abc123` as their pattern (`/verify/:token`). `routeTemplates` sends every page as its route template, and the new `solidRouterTemplate(useCurrentMatches())` helper resolves it from `@solidjs/router` without depending on it. Requires `@vskstudio/takt-core` 0.10.0.
