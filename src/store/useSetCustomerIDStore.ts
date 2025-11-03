// src\store\useSetCustomerIDStore.ts

'use client'

import { create } from 'zustand'

export interface SetCustomerIDObject {
    /** Objeto con pares clave–valor */
    options: Record<string, string>
}

interface SetCustomerIDState {
    nodes: Record<string, SetCustomerIDObject>
    initNode: (nodeId: string) => void
    getNodeData: (nodeId: string) => SetCustomerIDObject
    setNodeData: (nodeId: string, data: Partial<SetCustomerIDObject>) => void
    resetNode: (nodeId: string) => void
    resetAll: () => void
}

/**
 * 🧩 useSetCustomerIDStore (v1.0)
 * --------------------------------------------------
 * - Mantiene datos de nodos SetCustomerID
 * - Compatible con useNodeConfigStore
 * - Patrón idéntico a useGenerateTokenStore
 */
export const useSetCustomerIDStore = create<SetCustomerIDState>((set, get) => ({
    nodes: {},

    /** Inicializa el nodo si no existe */
    initNode: (nodeId) => {
        set((state) => {
            if (state.nodes[nodeId]) return state
            const newNode: SetCustomerIDObject = {
                options: {},
            }
            return { nodes: { ...state.nodes, [nodeId]: newNode } }
        })
    },

    /** Obtiene datos del nodo */
    getNodeData: (nodeId) => {
        const node = get().nodes[nodeId]
        if (!node) {
            get().initNode(nodeId)
            return get().nodes[nodeId]
        }
        return node
    },

    /** Actualiza parcialmente los datos */
    setNodeData: (nodeId, data) => {
        set((state) => {
            const current = get().getNodeData(nodeId)
            return {
                nodes: { ...state.nodes, [nodeId]: { ...current, ...data } },
            }
        })
    },

    /** Limpia un nodo */
    resetNode: (nodeId) =>
        set((state) => {
            const { [nodeId]: _, ...rest } = state.nodes
            return { nodes: rest }
        }),

    /** Limpia todos los nodos */
    resetAll: () => set({ nodes: {} }),
}))
