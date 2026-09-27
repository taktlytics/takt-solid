export type RouteMatchesAccessor = () => ReadonlyArray<{ route: { pattern: string } }>

export function solidRouterTemplate(matches: RouteMatchesAccessor): () => string | null {
  return () => {
    const current = matches()
    return current[current.length - 1]?.route.pattern ?? null
  }
}
