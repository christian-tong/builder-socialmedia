// src\store\GetDataComplete\useGetDataCompleteSimpleTextStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'

interface SimpleTextStoreState {
    /** ✏️ Actualiza el texto principal (prompt) */
    updatePrompt: (nodeId: string, value: string) => void

    /** 💾 Añade o actualiza setvariables (ej: "0": "REGRESAR") */
    updateSetVariable: (nodeId: string, key: string, val: string) => void

    /** 🗑️ Elimina un par de setvariables */
    removeSetVariable: (nodeId: string, key: string) => void

    /** 🔄 Actualiza campos generales como setvar, variable o condition */
    updateField: (
        nodeId: string,
        field: 'setvar' | 'variable' | 'condition' | 'iterations' | 'timeOut',
        value: string
    ) => void
}

/**
 * 🟠 useGetDataCompleteSimpleTextStore (v1.0)
 * ------------------------------------------------------------
 * - Maneja nodos tipo SIMPLETEXT (texto con opciones numeradas)
 * - Administra prompt y setvariables
 * - Sincroniza con useGetDataCompleteBaseStore
 */
export const useGetDataCompleteSimpleTextStore = create<SimpleTextStoreState>(
    () => ({
        updatePrompt: (nodeId, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            base.setNodeData(nodeId, { prompt: value })
        },

        updateSetVariable: (nodeId, key, val) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const updated = { ...node.setvariables, [key]: val }
            base.setNodeData(nodeId, { setvariables: updated })
        },

        removeSetVariable: (nodeId, key) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const updated = { ...node.setvariables }
            delete updated[key]
            base.setNodeData(nodeId, { setvariables: updated })
        },

        updateField: (nodeId, field, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            base.setNodeData(nodeId, { [field]: value })
        },
    })
)
