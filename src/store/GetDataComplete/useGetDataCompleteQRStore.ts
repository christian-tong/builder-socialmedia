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

    /** ✏️ Actualiza campo base del nodo */
    updateField: (
        nodeId: string,
        field:
            | 'condition'
            | 'groodText'
            | 'setvar'
            | 'variable'
            | 'alias'
            | 'iterations'
            | 'timeOut',
        value: string
    ) => void

    /** ⚙️ Actualiza setvariables (pares clave-valor) */
    updateSetVariables: (nodeId: string, vars: Record<string, string>) => void

    /** 🔒 Cambia el estado de saveHidden */
    toggleSaveHidden: (nodeId: string, checked: boolean) => void
}

/**
 * 🟢 useGetDataCompleteQRStore (v3.0 – Extended + Typed)
 * ------------------------------------------------------------
 * - Controla opciones del bloque QuickReply
 * - Gestiona también campos base y saveHidden
 * - Sin mutaciones directas, todo inmutable
 */
export const useGetDataCompleteQRStore = create<QuickReplyStoreState>(() => ({
    /* ---------------------------------------------------------------------- */
    /* 🧩 FUNCIONES DE OPCIONES (QuickReply)                                   */
    /* ---------------------------------------------------------------------- */
    addOption: (nodeId) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as
            | QuickReplyInteractive
            | undefined

        if (!interactive || interactive.type !== 'quick_reply') return

        const newOption: QuickReplyOption = {
            postbackText: '',
            type: 'text',
            title: '',
        }

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

        const updated: QuickReplyInteractive = {
            ...interactive,
            options: interactive.options.filter((_, i) => i !== index),
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    /* ---------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE DEL NODO PRINCIPAL                                       */
    /* ---------------------------------------------------------------------- */
    updateField: (nodeId, field, value) => {
        const base = useGetDataCompleteBaseStore.getState()
        const current: GetDataCompleteObject = base.getNodeData(nodeId)
        if (!current) return

        const updated: GetDataCompleteObject = {
            ...current,
            [field]: value,
        }

        base.setNodeData(nodeId, updated)
    },

    updateSetVariables: (nodeId, vars) => {
        const base = useGetDataCompleteBaseStore.getState()
        const current: GetDataCompleteObject = base.getNodeData(nodeId)
        if (!current) return

        const updated: GetDataCompleteObject = {
            ...current,
            setvariables: { ...vars },
        }

        base.setNodeData(nodeId, updated)
    },

    toggleSaveHidden: (nodeId, checked) => {
        const base = useGetDataCompleteBaseStore.getState()
        const current: GetDataCompleteObject = base.getNodeData(nodeId)
        if (!current) return

        const updated: GetDataCompleteObject = {
            ...current,
            saveHidden: checked,
        }

        base.setNodeData(nodeId, updated)
    },
}))
