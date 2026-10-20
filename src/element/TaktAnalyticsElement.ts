import { createTakt } from '@vskstudio/takt-core'

// Privacy attrs are default-on: only an explicit "false"/"0" disables them, so
// an absent attribute keeps the core default. Presence flags (outbound/files)
// are on when the attribute exists at all.
const truthy = (v: string | null): boolean => v !== 'false' && v !== '0'

// Built lazily: referencing HTMLElement at module load throws under SSR (Node),
// so the class is created only when registration runs in a DOM environment.
export function createTaktAnalyticsElement(): CustomElementConstructor {
  return class TaktAnalyticsElement extends HTMLElement {
    private disposers: Array<() => void> = []

    connectedCallback(): void {
      const attr = (name: string): string | null => this.getAttribute(name)
      const list = (name: string): string[] | undefined => {
        const value = attr(name)
        if (!value) return undefined
        const items = value.split(',').map((s) => s.trim()).filter(Boolean)
        return items.length > 0 ? items : undefined
      }
      const sampleRateAttr = attr('sample-rate')
      const queryParams = list('query-params')
      const exclude = list('exclude')
      const redactRoutes = list('redact-routes')
      const fileExtensions = list('file-extensions')
      const takt = createTakt({
        domain: attr('domain') ?? undefined,
        endpoint: attr('endpoint') ?? undefined,
        scriptOrigin: attr('script-origin') ?? undefined,
        respectDnt: truthy(attr('respect-dnt')),
        excludeLocalhost: truthy(attr('exclude-localhost')),
        ...(sampleRateAttr !== null && Number.isFinite(parseFloat(sampleRateAttr)) ? { sampleRate: parseFloat(sampleRateAttr) } : {}),
        ...(this.hasAttribute('track-query') ? { trackQuery: truthy(attr('track-query')) } : {}),
        ...(this.hasAttribute('debug') ? { debug: truthy(attr('debug')) } : {}),
        ...(queryParams ? { queryParams } : {}),
        ...(exclude ? { exclude } : {}),
        ...(redactRoutes ? { redactRoutes } : {}),
        ...(this.hasAttribute('redact-undecodable-paths') ? { redactUndecodablePaths: truthy(attr('redact-undecodable-paths')) } : {}),
        ...(this.hasAttribute('enabled') ? { enabled: truthy(attr('enabled')) } : {}),
      })
      if (truthy(attr('spa'))) this.disposers.push(takt.enableSpa())
      if (this.hasAttribute('outbound')) this.disposers.push(takt.enableOutbound())
      if (this.hasAttribute('files')) this.disposers.push(takt.enableFiles(fileExtensions))
      if (this.hasAttribute('track-404')) this.disposers.push(takt.enable404())
      if (this.hasAttribute('tagged')) this.disposers.push(takt.enableTagged())
      takt.pageview()
    }

    disconnectedCallback(): void {
      this.disposers.forEach((dispose) => dispose())
      this.disposers = []
    }
  }
}
