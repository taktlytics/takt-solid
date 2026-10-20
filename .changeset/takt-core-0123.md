---
"@vskstudio/takt-solid": patch
---

Ships `@vskstudio/takt-core` 0.12.3, which stops the `takt.auto.js` bundle from overwriting `window.takt`. The Solid wrapper does not load that bundle, so its runtime is unchanged. The `@vskstudio/takt-core` peer range is raised to `>=0.12.3`.
