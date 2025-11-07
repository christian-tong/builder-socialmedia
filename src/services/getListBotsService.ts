// src\services\getListBotsService.ts

'use client'

import { toast } from 'sonner'

export interface BotListItem {
    idBot: number
    aacc: string
    extensionAssign: string
    description: string
    configuration: string
    botType: string
    workflow: string
    metodo: number
}

export interface BotListResponse {
    success: boolean
    message?: string
    data?: BotListItem[]
    error?: string
}

/**
 * 🌐 getListBotsService v2.0 — Manejo completo de estado y errores
 * ----------------------------------------------------------------
 * - Gestiona loading / error / success con toast automático
 * - Devuelve data segura + helpers de estado
 */
export async function getListBots(
    type: string = 'WSP',
    apiUrl = process.env.NEXT_PUBLIC_API_URL ??
        'https://localhost:44385/workflow/listBot'
): Promise<BotListResponse> {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    try {
        toast.loading('Cargando lista de bots...', { id: 'bots-list' })

        const url = `${apiUrl}?type=${encodeURIComponent(type)}`
        const response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            cache: 'no-store',
            signal: controller.signal,
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error ${response.status}: ${errorText}`)
        }

        const json = await response.json()
        const bots: BotListItem[] = Array.isArray(json)
            ? json
            : Array.isArray(json.data)
              ? json.data
              : []

        toast.success('Bots cargados correctamente ✅', { id: 'bots-list' })
        return { success: true, data: bots }
    } catch (err: any) {
        console.error('❌ Error en getListBots:', err)
        const message =
            err.name === 'AbortError'
                ? 'La solicitud de bots fue cancelada (timeout).'
                : err.message || 'Error desconocido al obtener bots.'
        toast.error(message, { id: 'bots-list' })
        return { success: false, message, error: message }
    } finally {
        clearTimeout(timeout)
    }
}
