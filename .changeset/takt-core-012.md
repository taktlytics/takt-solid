---
"@vskstudio/takt-solid": minor
---

Expose the takt-core 0.12 options. `<Takt>` gains `redactUndecodablePaths`, and `<takt-analytics>` gains the `redact-undecodable-paths` and `file-extensions` attributes. `normalizeHost` and the `Payload`, `RouteTemplateResolver` and `TrackOptions` types are re-exported. The peer dependency moves to `@vskstudio/takt-core` `>=0.12.0`, since these options need that core. Minor, because the new options are additive.
