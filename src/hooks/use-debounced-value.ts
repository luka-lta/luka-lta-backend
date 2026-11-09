import { useEffect, useState } from 'react'

/** Liefert `value` erst, nachdem er `delay` ms unverändert war. */
export function useDebouncedValue<T>(value: T, delay = 350): T {
    const [debounced, setDebounced] = useState(value)
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay)
        return () => clearTimeout(timer)
    }, [value, delay])
    return debounced
}
