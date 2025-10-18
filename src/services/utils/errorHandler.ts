// src/services/utils/errorHandler.ts

/**
 * 🎯 handleServiceError — Manejador centralizado de errores de servicio
 * --------------------------------------------------------------------
 * - Captura excepciones y las formatea para mostrar en toast o logs
 * - Retorna un mensaje legible para el usuario
 */
export function handleServiceError(error: unknown, context?: string): string {
    let message = 'Error desconocido'

    if (error instanceof Error) {
        message = error.message
    } else if (typeof error === 'string') {
        message = error
    }

    // Log técnico (para consola o futura herramienta de monitoreo)
    console.error(`❌ [${context || 'ServiceError'}]:`, error)

    // Mensaje legible para UI
    return context
        ? `Ocurrió un error al ${context.toLowerCase()}.`
        : 'Ocurrió un error inesperado.'
}
