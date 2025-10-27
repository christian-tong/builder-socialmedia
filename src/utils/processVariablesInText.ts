// src\utils\processVariablesInText.ts

import { useVariablesStore } from '@/store/useVariablesStore'

/**
 * 🔄 Convierte texto con @VARIABLE a plantilla con ${VARIABLE}
 * Ejemplo: "Hola @NOMBRE" → "Hola ${NOMBRE}"
 */
export function convertMentionsToTemplate(text: string): string {
    return text.replace(/@([A-Z0-9_]+)/gi, '${$1}')
}

/**
 * 🧩 Reemplaza menciones con sus valores del store
 * Ejemplo: "Hola @NOMBRE" → "Hola CHRISTIAN"
 */
export function processVariablesInText(text: string): string {
    const { getAllVariables } = useVariablesStore.getState()
    const variables = getAllVariables()
    return text.replace(/@([A-Z0-9_]+)/gi, (_, key) => {
        return variables[key] ?? `@${key}`
    })
}
