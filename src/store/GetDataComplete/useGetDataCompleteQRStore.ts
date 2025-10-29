// src/store/GetDataComplete/useGetDataCompleteQRStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'
import type {
    GetDataCompleteObject,
    QuickReplyInteractive,
    QuickReplyOption,
} from '@/types/getDataComplete'

interface QuickReplyStoreState {
    /** ➕ Añade una nueva opción */
    addOption: (nodeId: string) => void

    /** 🗑️ Elimina una opción por índice */
    removeOption: (nodeId: string, index: number) => void
}

/**
 * 🟢 useGetDataCompleteQRStore (v2.1 – Fully Typed)
 * ------------------------------------------------------------
 * - Maneja opciones del bloque QuickReply
 * - Totalmente tipado con seguridad de null checks
 * - Sin mutaciones directas del estado (usa copias inmutables)
 */
export const useGetDataCompleteQRStore = create<QuickReplyStoreState>(() => ({
    addOption: (nodeId) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as
            | QuickReplyInteractive
            | undefined

        if (!interactive || interactive.type !== 'quick_reply') return

        // Nueva opción vacía
        const newOption: QuickReplyOption = {
            postbackText: '',
            type: 'text',
            title: '',
        }

        // Copia segura del bloque actualizado
        const updated: QuickReplyInteractive = {
            ...interactive,
            options: [...interactive.options, newOption],
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    removeOption: (nodeId, index) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as
            | QuickReplyInteractive
            | undefined

        if (!interactive || interactive.type !== 'quick_reply') return

        const updatedOptions = interactive.options.filter((_, i) => i !== index)

        const updated: QuickReplyInteractive = {
            ...interactive,
            options: updatedOptions,
        }

        base.setNodeData(nodeId, { interactive: updated })
    },
}))
