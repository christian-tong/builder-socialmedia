// src\services\postBotService.ts

'use client'

export interface BotPayload {
    configuration: string
    workflow: string
    channel?: string
    description: string
    extensionAssign: string
}

export interface BotResponse {
    success: boolean
    message?: string
    data?: any
}

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

export async function postBotFlow(
    payload: BotPayload,
    apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'https://localhost:44385'
): Promise<BotResponse> {
    try {
        const botType = resolveBotType(payload.channel)

        const finalPayload = {
            idBot: 0,
            aacc: 'WIMPROVE',
            extensionAssign: payload.extensionAssign,
            description: payload.description,
            configuration: payload.configuration,
            workflow: payload.workflow,
            botType,
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

        let data: any = null
        const contentLength = response.headers.get('content-length')
        if (response.status !== 204 && contentLength !== '0') {
            try {
                data = await response.json()
            } catch {
                data = null
            }
        }

        return { success: true, data }
    } catch (error: any) {
        console.error('❌ Error en postBotFlow:', error)
        return { success: false, message: error.message }
    }
}
