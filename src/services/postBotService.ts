// src\services\postBotService.ts

'use client'

/**
 * 🧠 botService.ts — Servicio de publicación de flujos conversacionales
 * ------------------------------------------------------------
 * - Recibe datos mínimos desde el modal (configuration, channel, description, extensionAssign)
 * - Completa internamente los metadatos ocultos
 * - Determina automáticamente el botType según el canal
 */

export interface BotPayload {
    configuration: string
    channel?: string
    description: string
    extensionAssign: string
}

export interface BotResponse {
    success: boolean
    message?: string
    data?: any
}

/**
 * Determina el botType basado en el canal seleccionado
 */
function resolveBotType(channel?: string): string {
    switch (channel?.toLowerCase()) {
        case 'whatsapp':
            return 'WSP'
        case 'chatweb':
            return 'WEB'
        default:
            return 'GEN'
    }
}

/**
 * Publica el flujo conversacional al backend.
 */
export async function postBotFlow(
    payload: BotPayload,
    apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:44385'
): Promise<BotResponse> {
    try {
        const botType = resolveBotType(payload.channel)

        // 🧩 Estructura final enviada al backend
        const finalPayload = {
            idBot: 0,
            aacc: 'WIMPROVE',
            extensionAssign: payload.extensionAssign,
            description: payload.description,
            configuration: payload.configuration,
            botType,
            workflow: '',
            metodo: -1,
        }

        const response = await fetch(`${apiUrl}/workflow/addBot`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        })

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`Error ${response.status}: ${errorText}`)
        }

        // ✅ Manejar casos donde la respuesta está vacía (204 o sin body)
        let data: any = null
        const contentLength = response.headers.get('content-length')

        if (response.status !== 204 && contentLength !== '0') {
            try {
                data = await response.json()
            } catch {
                // Si no hay JSON válido, se ignora el error silenciosamente
                data = null
            }
        }

        return { success: true, data }
    } catch (error: any) {
        console.error('❌ Error en postBotFlow:', error)
        return { success: false, message: error.message }
    }
}
