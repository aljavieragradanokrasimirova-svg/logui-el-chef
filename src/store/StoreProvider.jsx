import { createContext, useContext, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { reducer, createActions } from './reducer.js'
import { loadState, saveState, sanitizeState, STORAGE_KEY } from './storage.js'
import { setHapticsEnabled } from '../feel/haptics.js'

const StoreContext = createContext(null)

/**
 * Estado global: se carga de localStorage al arrancar, se guarda tras cada cambio
 * y se sincroniza si la app está abierta en otra pestaña.
 */
export function StoreProvider({ children, storage }) {
  const [state, dispatch] = useReducer(reducer, storage, (s) => loadState(s))
  const [saveFailed, setSaveFailed] = useState(false)
  const fromOtherTab = useRef(false)

  useEffect(() => {
    if (fromOtherTab.current) {
      fromOtherTab.current = false
      return
    }
    setSaveFailed(!saveState(state, storage))
  }, [state, storage])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || event.newValue == null) return
      try {
        const next = sanitizeState(JSON.parse(event.newValue))
        fromOtherTab.current = true
        dispatch({ type: 'state/replace', state: next })
      } catch {
        // la otra pestaña escribió algo ilegible: lo ignoramos
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const reduceMotion = state.settings.reduceMotion
  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])

  const { haptics, theme } = state.settings
  useEffect(() => setHapticsEnabled(haptics), [haptics])
  useEffect(() => {
    // 'auto' sigue al sistema (CSS con prefers-color-scheme); 'light'/'dark' lo fuerzan.
    if (theme === 'auto') delete document.documentElement.dataset.theme
    else document.documentElement.dataset.theme = theme
  }, [theme])

  const actions = useMemo(() => createActions(dispatch), [])
  const value = useMemo(() => ({ state, actions, saveFailed }), [state, actions, saveFailed])
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

/** `{ state, actions, saveFailed }` del store. */
export function useStore() {
  const value = useContext(StoreContext)
  if (!value) throw new Error('useStore debe usarse dentro de <StoreProvider>')
  return value
}

/** Una lista por id, o `undefined`. */
export function useList(listId) {
  const { state } = useStore()
  return state.lists.find((l) => l.id === listId)
}
