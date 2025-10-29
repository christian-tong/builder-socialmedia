// src\store\useGenerateTokenStore.ts

'use client'

import { create } from 'zustand'

export interface GenerateTokenObject {
    mode: string
    text: string
    body: Record<string, string>
    script: string
}

interface GenerateTokenState {
    nodes: Record<string, GenerateTokenObject>
    initNode: (nodeId: string) => void
    getNodeData: (nodeId: string) => GenerateTokenObject
    setNodeData: (nodeId: string, data: Partial<GenerateTokenObject>) => void
    resetNode: (nodeId: string) => void
    resetAll: () => void
}

export const useGenerateTokenStore = create<GenerateTokenState>((set, get) => ({
    nodes: {},

    /** 🧩 Inicializa el nodo si no existe */
    initNode: (nodeId) => {
        set((state) => {
            if (state.nodes[nodeId]) return state
            const newNode: GenerateTokenObject = {
                mode: 'simpletext',
                text: 'Clic aquí',
                body: {},
                script: '',
            }
            return { nodes: { ...state.nodes, [nodeId]: newNode } }
        })
    },

    /** 🔍 Obtiene los datos del nodo */
    getNodeData: (nodeId) => {
        const node = get().nodes[nodeId]
        if (!node) {
            get().initNode(nodeId)
            return get().nodes[nodeId]
        }
        return node
    },

    /** 💾 Actualiza parcialmente los datos */
    setNodeData: (nodeId, data) => {
        set((state) => {
            const current = get().getNodeData(nodeId)
            return {
                nodes: { ...state.nodes, [nodeId]: { ...current, ...data } },
            }
        })
    },

    /** 🧹 Limpia un nodo específico */
    resetNode: (nodeId) =>
        set((state) => {
            const { [nodeId]: _, ...rest } = state.nodes
            return { nodes: rest }
        }),

    /** 🧼 Limpia todos los nodos */
    resetAll: () => set({ nodes: {} }),
}))
