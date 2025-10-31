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
 * 🧩 useSaveRecordStore (v2.1 — preserva objetos anidados en body)
 * ------------------------------------------------------------
 * ✅ Evita que body convierta objetos a "[object Object]"
 * ✅ Conserva estructura JSON completa
 * ✅ Total compatibilidad con el patrón diferido
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

        // Asegura que body sea siempre un string JSON válido
        try {
            if (typeof node.body === 'object') {
                return {
                    ...node,
                    body: JSON.stringify(node.body, null, 2),
                }
            }

            // Si es string pero no es JSON válido, mantenerlo
            JSON.parse(node.body)
            return node
        } catch {
            return {
                ...node,
                body: JSON.stringify({ raw: node.body || '' }, null, 2),
            }
        }
    },

    /** 💾 Merge y guardado seguro */
    setNodeData: (nodeId, data) => {
        set((state) => {
            const current = state.nodes[nodeId] || {
                auth: { headers: {}, vartoken: '', body: '', url: '' },
                body: '',
                nextNodeId: undefined,
            }

            let normalizedBody = data.body ?? current.body

            // 🔧 Si viene como objeto, serializarlo
            if (typeof normalizedBody === 'object') {
                try {
                    normalizedBody = JSON.stringify(normalizedBody, null, 2)
                } catch {
                    normalizedBody = '{}'
                }
            }

            // 🔧 Si es string pero parece JSON inválido, intentar repararlo
            if (typeof normalizedBody === 'string') {
                try {
                    JSON.parse(normalizedBody)
                } catch {
                    normalizedBody = JSON.stringify(
                        { value: normalizedBody },
                        null,
                        2
                    )
                }
            }

            const merged: SaveRecordObject = {
                ...current,
                ...data,
                body: normalizedBody,
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
