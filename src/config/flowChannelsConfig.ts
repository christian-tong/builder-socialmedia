// src/config/flowChannelsConfig.ts
'use client'

import { Smartphone, MessageSquare } from 'lucide-react'

/**
 * 🎯 FlowChannelConfig (v1.0)
 * -------------------------------------------------------------
 * Define los diferentes tipos de canales disponibles
 * en el builder de Social Media.
 *
 * - Usa un enum para mantener consistencia en todo el sistema.
 * - Cada canal incluye metadatos (label, icono, color).
 * - Se puede extender fácilmente sin romper código existente.
 */

export enum FlowChannelEnum {
    WHATSAPP = 'whatsapp',
    CHATWEB = 'chatweb',
}

export interface FlowChannelConfig {
    label: string
    value: FlowChannelEnum
    color: string
    icon: React.ElementType
}

/**
 * Lista central de canales configurados
 */
export const FLOW_CHANNELS: FlowChannelConfig[] = [
    {
        label: 'WhatsApp',
        value: FlowChannelEnum.WHATSAPP,
        color: 'text-green-500',
        icon: Smartphone,
    },
    {
        label: 'Chat Web',
        value: FlowChannelEnum.CHATWEB,
        color: 'text-sky-500',
        icon: MessageSquare,
    },
]
