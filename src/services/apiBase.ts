// src/services/apiBase.ts

import { alertHandler } from './utils/alertHandler'
import { handleServiceError } from './utils/errorHandler'

/**
 * 🧱 apiBase — Servicio base simulado
 * -------------------------------------------------------
 * - En el futuro esto será un wrapper de fetch/axios real
 * - Por ahora simula una llamada GET que devuelve datos locales
 */

export async function fakeApiGet<T>(path: string): Promise<T> {
    try {
        alertHandler.info('Cargando datos...')

        // 🔸 Simulación de un delay de red
        await new Promise((resolve) => setTimeout(resolve, 200))

        if (path === '/skills') {
            const module = await import('@/services/mocks/skillsData')
            alertHandler.success('Datos cargados correctamente')
            return module.default as T
        }

        throw new Error(`Ruta no encontrada: ${path}`)
    } catch (error) {
        const msg = handleServiceError(error, `obtener datos desde ${path}`)
        alertHandler.error(msg)
        throw error
    }
}
