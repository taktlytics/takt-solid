import { createContext, useContext, type Accessor } from 'solid-js'
import type { TaktInstance } from './noop'

export type { TaktInstance }

// Le Provider de Solid lit `props.value` sous `untrack` : une valeur brute serait
// figée à celle du premier rendu (null, l'instance n'arrivant qu'en onMount). On
// transporte donc un canal stable qui porte l'accesseur, lu à chaque résolution.
export interface TaktChannel {
  instance: Accessor<TaktInstance | null>
}

// Le contexte est le canal in-tree ; le store de module est le repli hors arbre
// pour createTaktEvent et les appelants sans provider.
export const TaktContext = createContext<TaktChannel | null>(null)

export const taktStore: { value: TaktInstance | null } = { value: null }

// Forme liée au composant, doit être appelée sous <Takt>. Préfère l'instance du contexte.
export function useResolveTakt(): TaktInstance | null {
  return useContext(TaktContext)?.instance() ?? taktStore.value
}

// Forme non réactive, sûre au moment du clic / hors de l'arbre de composants.
export function resolveTakt(): TaktInstance | null {
  return taktStore.value
}
