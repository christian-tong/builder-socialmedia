// src\hooks\useBeforeUnloadWarning.ts

import { useEffect } from 'react'

export function useBeforeUnloadWarning(enabled: boolean, message?: string) {
    useEffect(() => {
        if (!enabled) return

        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault()
            event.returnValue =
                message || 'Hay cambios sin guardar. ¿Salir de todos modos?'
            return message
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [enabled, message])
}
