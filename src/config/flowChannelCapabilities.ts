// src/config/flowChannelCapabilities.ts
'use client'

import { FlowChannelEnum } from '@/config/flowChannelsConfig'

/**
 * 🎛️ flowChannelCapabilities (v1.0)
 * -------------------------------------------------------------------
 * Define qué tipos de interacciones están disponibles
 * para cada canal dentro del Builder Social Media.
 *
 * Esto centraliza las reglas y permite escalabilidad.
 */

export type InteractiveType = 'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT'

export interface ChannelCapabilities {
    allowedInteractiveTypes: InteractiveType[]
}

export const FLOW_CHANNEL_CAPABILITIES: Record<
    FlowChannelEnum,
    ChannelCapabilities
> = {
    [FlowChannelEnum.WHATSAPP]: {
        allowedInteractiveTypes: ['quick_reply', 'list'],
    },
    [FlowChannelEnum.CHATWEB]: {
        allowedInteractiveTypes: ['GETDATA', 'SIMPLETEXT'],
    },
}
