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
    /** 🧩 Opcional: referencia al siguiente nodo */
    nextNodeId?: string
}

interface SaveRecordState {
    nodes: Record<string, SaveRecordObject>
    debug: boolean

    /** 🔧 CRUD básico */
    initNode: (nodeId: string) => void
    getNodeData: (nodeId: string) => SaveRecordObject
    setNodeData: (nodeId: string, data: Partial<SaveRecordObject>) => void
    safeUpdateAuth: (
        nodeId: string,
        partialAuth: Partial<SaveRecordObject['auth']>
    ) => void
    resetNode: (nodeId: string) => void
    resetAll: () => void

    /** 🔁 Callback post-save */
    onAfterSave?: (nodeId: string, data: SaveRecordObject) => void
    setAfterSaveCallback: (
        cb: (nodeId: string, data: SaveRecordObject) => void
    ) => void
    triggerAfterSave: (nodeId: string) => void
}

/**
 * 🧩 useSaveRecordStore (v2.0 — con post-save callback)
 * ------------------------------------------------------------
 * ✅ Compatible con FlowAutoEdgeSync
 * ✅ Patrón diferido seguro
 * ✅ Callbacks reutilizables por tipo de nodo
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
                nextNodeId: undefined,
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
                nextNodeId: undefined,
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

    /** 🔁 Callbacks post-save */
    setAfterSaveCallback: (cb) => set({ onAfterSave: cb }),

    triggerAfterSave: (nodeId) => {
        const node = get().getNodeData(nodeId)
        const cb = get().onAfterSave
        if (!cb) return
        try {
            cb(nodeId, node)
        } catch (err) {
            console.error('❌ [SaveRecordStore] Error en onAfterSave:', err)
        }
    },
}))
