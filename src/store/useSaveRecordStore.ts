// src\store\useSaveRecordStore.ts

// src/store/useSaveRecordStore.ts
'use client'

import { create } from 'zustand'

export interface SaveRecordObject {
    auth: {
        headers: Record<string, string>
        vartoken: string
        body: string
        url: string
    }
    body: string
}

interface SaveRecordState {
    nodes: Record<string, SaveRecordObject>
    debug: boolean

    initNode: (nodeId: string) => void
    getNodeData: (nodeId: string) => SaveRecordObject
    setNodeData: (nodeId: string, data: Partial<SaveRecordObject>) => void
    safeUpdateAuth: (
        nodeId: string,
        partialAuth: Partial<SaveRecordObject['auth']>
    ) => void
    resetNode: (nodeId: string) => void
    resetAll: () => void
}

/**
 * 🧩 useSaveRecordStore (v1.3 — alineado con Patrón Diferido)
 * ------------------------------------------------------------
 * ✅ Inicialización inmutable
 * ✅ Merge seguro y reutilizable
 * ✅ Logs consistentes y desactivables
 */
export const useSaveRecordStore = create<SaveRecordState>((set, get) => ({
    nodes: {},
    debug: false,

    /** 🆕 Inicializa un nodo si no existe */
    initNode: (nodeId) => {
        set((state) => {
            if (state.nodes[nodeId]) return state
            const newNode: SaveRecordObject = {
                auth: { headers: {}, vartoken: '', body: '', url: '' },
                body: '',
            }
            const updated = { ...state.nodes, [nodeId]: newNode }
            if (state.debug)
                console.log(`🆕 [SaveRecordStore] Nodo inicializado: ${nodeId}`)
            return { nodes: updated }
        })
    },

    /** 📖 Obtiene los datos del nodo (auto-init si no existe) */
    getNodeData: (nodeId) => {
        const node = get().nodes[nodeId]
        if (!node) {
            get().initNode(nodeId)
            return get().nodes[nodeId]
        }
        return node
    },

    /** 💾 Merge y guardado seguro */
    setNodeData: (nodeId, data) => {
        set((state) => {
            const current = state.nodes[nodeId] || {
                auth: { headers: {}, vartoken: '', body: '', url: '' },
                body: '',
            }

            const merged: SaveRecordObject = {
                ...current,
                ...data,
                auth: { ...current.auth, ...(data.auth || {}) },
            }

            const updated = { ...state.nodes, [nodeId]: merged }
            if (state.debug)
                console.log(
                    `💾 [SaveRecordStore] Nodo actualizado: ${nodeId}`,
                    merged
                )
            return { nodes: updated }
        })
    },

    /** ✅ SafeUpdateAuth — actualización granular */
    safeUpdateAuth: (nodeId, partialAuth) => {
        set((state) => {
            const current = state.nodes[nodeId] || {
                auth: { headers: {}, vartoken: '', body: '', url: '' },
                body: '',
            }

            const mergedAuth = {
                ...current.auth,
                ...partialAuth,
                headers: { ...(current.auth.headers || {}) },
            }

            const updated: SaveRecordObject = { ...current, auth: mergedAuth }
            const nodes = { ...state.nodes, [nodeId]: updated }

            if (state.debug)
                console.log(
                    `🔐 [SaveRecordStore] Auth actualizado: ${nodeId}`,
                    mergedAuth
                )
            return { nodes }
        })
    },

    /** 🗑️ Limpieza de un nodo */
    resetNode: (nodeId) => {
        set((state) => {
            const { [nodeId]: _, ...rest } = state.nodes
            if (state.debug)
                console.log(`🗑️ [SaveRecordStore] Nodo eliminado: ${nodeId}`)
            return { nodes: rest }
        })
    },

    /** 🧹 Limpieza total */
    resetAll: () => {
        if (get().debug)
            console.log('🧹 [SaveRecordStore] Todos los nodos limpiados')
        set({ nodes: {} })
    },
}))
