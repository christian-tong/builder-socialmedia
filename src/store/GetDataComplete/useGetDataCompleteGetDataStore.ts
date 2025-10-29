// src\store\GetDataComplete\useGetDataCompleteGetDataStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'

interface GetDataStoreState {
    /** ✏️ Actualiza el prompt del nodo */
    updatePrompt: (nodeId: string, value: string) => void

    /** 🔢 Actualiza una variable o condición individual */
    updateField: (
        nodeId: string,
        field: 'setvar' | 'variable' | 'condition' | 'iterations' | 'timeOut',
        value: string
    ) => void

    /** 💾 Añade o actualiza setvariables (ej: 1: "Sí", 2: "No") */
    updateSetVariable: (nodeId: string, key: string, val: string) => void

    /** 🗑️ Elimina un par de setvariables */
    removeSetVariable: (nodeId: string, key: string) => void
}

/**
 * 🟡 useGetDataCompleteGetDataStore (v1.0)
 * ------------------------------------------------------------
 * - Maneja nodos tipo GETDATA (entrada directa)
 * - Administra prompt, setvariables y campos base
 * - Sincroniza con useGetDataCompleteBaseStore
 */
export const useGetDataCompleteGetDataStore = create<GetDataStoreState>(() => ({
    updatePrompt: (nodeId, value) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        base.setNodeData(nodeId, { prompt: value })
    },

    updateField: (nodeId, field, value) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        base.setNodeData(nodeId, { [field]: value })
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
}))
