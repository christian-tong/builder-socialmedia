// src\store\useChatBotIAStore.ts

'use client'

import { create } from 'zustand'

/* --------------------------------------------------------------
 🧩 Tipado base del objeto persistente
-------------------------------------------------------------- */
export interface ChatBotIARequest {
    variable: string
    url: string
    body: string
    lastRequest?: string
    lastResponse?: string
}

/* --------------------------------------------------------------
 🧠 Estado global especializado para ChatBotIARequestNode
-------------------------------------------------------------- */
interface ChatBotIAState {
    /** Todos los nodos ChatBotIA registrados */
    nodes: Record<string, ChatBotIARequest>

    /** Inicializa el nodo si no existe */
    initNode: (nodeId: string) => void

    /** Obtiene datos del nodo */
    getNodeData: (nodeId: string) => ChatBotIARequest

    /** Actualiza o inserta datos de un nodo */
    setNodeData: (nodeId: string, data: Partial<ChatBotIARequest>) => void

    /** Elimina un nodo (sin afectar otros) */
    resetNode: (nodeId: string) => void

    /** Limpia completamente el store */
    resetAll: () => void

    /** 🔍 Logs útiles para debug */
    debug?: boolean
}

/* --------------------------------------------------------------
 🧩 Implementación del store (v1.1 compatible)
-------------------------------------------------------------- */
export const useChatBotIAStore = create<ChatBotIAState>((set, get) => ({
    nodes: {},
    debug: false,

    /** Inicializa el nodo si no existe */
    initNode: (nodeId) => {
        const { nodes } = get()
        if (!nodes[nodeId]) {
            nodes[nodeId] = {
                variable: '',
                url: '',
                body: '',
            }
            set({ nodes: { ...nodes } })
            if (get().debug)
                console.log(`🆕 [ChatBotIAStore] Nodo inicializado: ${nodeId}`)
        }
    },

    /** Obtiene los datos persistidos del nodo */
    getNodeData: (nodeId) => {
        const node = get().nodes[nodeId]
        if (!node) {
            get().initNode(nodeId)
            return get().nodes[nodeId]
        }
        return node
    },

    /** Actualiza datos del nodo de forma parcial */
    setNodeData: (nodeId, data) => {
        const current = get().nodes[nodeId] || {}
        const merged = { ...current, ...data }
        set((state) => ({
            nodes: { ...state.nodes, [nodeId]: merged },
        }))
        if (get().debug)
            console.log(
                `💾 [ChatBotIAStore] Nodo actualizado: ${nodeId}`,
                merged
            )
    },

    /** Elimina los datos de un nodo específico */
    resetNode: (nodeId) => {
        set((state) => {
            const newNodes = { ...state.nodes }
            delete newNodes[nodeId]
            return { nodes: newNodes }
        })
        if (get().debug)
            console.log(`🗑️ [ChatBotIAStore] Nodo eliminado: ${nodeId}`)
    },

    /** Limpia completamente el store */
    resetAll: () => {
        set({ nodes: {} })
        if (get().debug)
            console.log('🧹 [ChatBotIAStore] Todos los nodos limpiados')
    },
}))
