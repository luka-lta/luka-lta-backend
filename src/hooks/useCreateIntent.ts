import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/** Query-Parameter, mit dem Schnellaktionen den Anlegen-Dialog einer Seite öffnen. */
export const CREATE_INTENT_PARAM = 'create'

/** Baut einen Link, der auf der Zielseite direkt den Anlegen-Dialog öffnet. */
export function withCreateIntent(path: string): string {
    return `${path}?${CREATE_INTENT_PARAM}=1`
}

/**
 * Öffnet einmalig den Anlegen-Dialog, wenn die Seite mit `?create=1` aufgerufen wird,
 * und entfernt den Parameter wieder, damit Neuladen/Zurück ihn nicht erneut auslöst.
 */
export function useCreateIntent(onCreate: () => void) {
    const [params, setParams] = useSearchParams()
    const callback = useRef(onCreate)
    callback.current = onCreate

    useEffect(() => {
        if (params.get(CREATE_INTENT_PARAM) !== '1') return
        callback.current()
        const next = new URLSearchParams(params)
        next.delete(CREATE_INTENT_PARAM)
        setParams(next, { replace: true })
    }, [params, setParams])
}
