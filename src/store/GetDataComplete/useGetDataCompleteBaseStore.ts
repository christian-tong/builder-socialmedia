// src/store/GetDataComplete/useGetDataCompleteBaseStore.ts

'use client'

import { create } from 'zustand'
import {
    GetDataCompleteObject,
    createEmptyGetDataCompleteObject,
} from '@/types/getDataComplete'

export interface GetDataCompleteState {
    nodes: Record<string, GetDataCompleteObject>
    debug: boolean

    initNode: (nodeId: string) => void
    getNodeData: (nodeId: string) => GetDataCompleteObject
    setNodeData: (nodeId: string, data: Partial<GetDataCompleteObject>) => void
    resetNode: (nodeId: string) => void
    resetAll: () => void

    /** 🔁 Callback global post-save */
    onAfterSave?: (nodeId: string, data: GetDataCompleteObject) => void
    setAfterSaveCallback: (
        cb: (nodeId: string, data: GetDataCompleteObject) => void
    ) => void

    /** ⚙️ Disparador manual */
    triggerAfterSave: (nodeId: string) => void
}

export const useGetDataCompleteBaseStore = create<GetDataCompleteState>(
    (set, get) => ({
        nodes: {},
        debug: false,

        initNode: (nodeId) =>
            set((state) => {
                if (state.nodes[nodeId]) return state
                return {
                    nodes: {
                        ...state.nodes,
                        [nodeId]: createEmptyGetDataCompleteObject(),
                    },
                }
            }),

        getNodeData: (nodeId) => {
            const node = get().nodes[nodeId]
            if (!node) {
                get().initNode(nodeId)
                return get().nodes[nodeId]
            }
            return node
        },

        setNodeData: (nodeId, data) =>
            set((state) => {
                const current = get().getNodeData(nodeId)
                const merged = { ...current, ...data }
                if (state.debug) console.log(`💾 [GDC] Nodo ${nodeId}`, merged)
                return { nodes: { ...state.nodes, [nodeId]: merged } }
            }),

        resetNode: (nodeId) =>
            set((state) => {
                const { [nodeId]: _, ...rest } = state.nodes
                return { nodes: rest }
            }),

        resetAll: () => set({ nodes: {} }),

        setAfterSaveCallback: (cb) => set({ onAfterSave: cb }),

        triggerAfterSave: (nodeId) => {
            const node = get().getNodeData(nodeId)
            const cb = get().onAfterSave
            if (!cb) return
            try {
                cb(nodeId, node)
            } catch (err) {
                console.error('❌ [GDC] Error onAfterSave:', err)
            }
        },
    })
)

// ❌ Importante: NO usar hooks aquí, ni registrar callbacks automáticos en módulo.
// Todo registro se hará desde FlowAutoEdgeSync.
