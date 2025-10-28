// src\store\useSaveRecordStore.ts
'use client'

import { create } from 'zustand'

/* --------------------------------------------------------------
 🧩 Tipado del objeto persistente
-------------------------------------------------------------- */
export interface SaveRecordObject {
    auth: {
        headers: Record<string, string>
        vartoken: string
        body: string
        url: string
    }
    body: string
}

/* --------------------------------------------------------------
 🧠 Estado global especializado para SaveRecordNode
-------------------------------------------------------------- */
interface SaveRecordState {
    nodes: Record<string, SaveRecordObject>

    initNode: (nodeId: string) => void
    getNodeData: (nodeId: string) => SaveRecordObject
    setNodeData: (nodeId: string, data: Partial<SaveRecordObject>) => void
    safeUpdateAuth: (
        nodeId: string,
        partialAuth: Partial<SaveRecordObject['auth']>
    ) => void
    resetNode: (nodeId: string) => void
    resetAll: () => void

    debug?: boolean
}

/* --------------------------------------------------------------
 🧩 Implementación (v1.2 con safeUpdateAuth)
-------------------------------------------------------------- */
export const useSaveRecordStore = create<SaveRecordState>((set, get) => ({
    nodes: {},
    debug: false,

    initNode: (nodeId) => {
        const { nodes } = get()
        if (!nodes[nodeId]) {
            nodes[nodeId] = {
                auth: { headers: {}, vartoken: '', body: '', url: '' },
                body: '',
            }
            set({ nodes: { ...nodes } })
            if (get().debug)
                console.log(`🆕 [SaveRecordStore] Nodo inicializado: ${nodeId}`)
        }
    },

    getNodeData: (nodeId) => {
        const node = get().nodes[nodeId]
        if (!node) {
            get().initNode(nodeId)
            return get().nodes[nodeId]
        }
        return node
    },

    setNodeData: (nodeId, data) => {
        const current = get().nodes[nodeId] || {
            auth: { headers: {}, vartoken: '', body: '', url: '' },
            body: '',
        }
        const merged = {
            ...current,
            ...data,
            auth: { ...current.auth, ...(data.auth || {}) },
        }
        set((state) => ({
            nodes: { ...state.nodes, [nodeId]: merged },
        }))
        if (get().debug)
            console.log(
                `💾 [SaveRecordStore] Nodo actualizado: ${nodeId}`,
                merged
            )
    },

    /** ✅ SafeUpdateAuth — actualiza auth de forma segura */
    safeUpdateAuth: (nodeId, partialAuth) => {
        const current = get().nodes[nodeId] || {
            auth: { headers: {}, vartoken: '', body: '', url: '' },
            body: '',
        }
        const mergedAuth = {
            headers: { ...(current.auth.headers || {}) },
            vartoken: partialAuth.vartoken ?? current.auth.vartoken,
            body: partialAuth.body ?? current.auth.body,
            url: partialAuth.url ?? current.auth.url,
        }
        const updated = { ...current, auth: mergedAuth }
        set((state) => ({
            nodes: { ...state.nodes, [nodeId]: updated },
        }))
        if (get().debug)
            console.log(
                `🧩 [SaveRecordStore] Auth actualizado: ${nodeId}`,
                mergedAuth
            )
    },

    resetNode: (nodeId) => {
        set((state) => {
            const newNodes = { ...state.nodes }
            delete newNodes[nodeId]
            return { nodes: newNodes }
        })
        if (get().debug)
            console.log(`🗑️ [SaveRecordStore] Nodo eliminado: ${nodeId}`)
    },

    resetAll: () => {
        set({ nodes: {} })
        if (get().debug)
            console.log('🧹 [SaveRecordStore] Todos los nodos limpiados')
    },
}))
