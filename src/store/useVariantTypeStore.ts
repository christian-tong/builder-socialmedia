// src/store/useVariantTypeStore.ts

'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { VariantKey } from '@/config/getDataVariantsConfig'

export interface VariantNodeData {
    type: VariantKey
    options: any[]
    conditions: Record<string, string>
}

interface VariantTypeState {
    nodes: Record<string, VariantNodeData>

    /** 🔹 CRUD de tipo de variante */
    setVariantType: (nodeId: string, type: VariantKey) => void
    getVariantType: (nodeId: string) => VariantKey

    /** 🔹 CRUD de opciones */
    setVariantOptions: (nodeId: string, options: any[]) => void
    getVariantOptions: (nodeId: string) => any[]

    /** 🔹 CRUD de condiciones */
    setVariantConditions: (
        nodeId: string,
        conditions: Record<string, string>
    ) => void
    getVariantConditions: (nodeId: string) => Record<string, string>

    /** 🔹 Sincronización completa */
    setVariantAll: (nodeId: string, data: Partial<VariantNodeData>) => void

    /** 🔹 Elimina completamente un nodo */
    resetNode: (nodeId: string) => void
}

export const useVariantTypeStore = create<VariantTypeState>()(
    persist(
        (set, get) => ({
            nodes: {},

            // --- TYPE ---
            setVariantType: (nodeId, type) =>
                set((state) => ({
                    nodes: {
                        ...state.nodes,
                        [nodeId]: {
                            ...(state.nodes[nodeId] ?? {
                                options: [],
                                conditions: {},
                            }),
                            type,
                        },
                    },
                })),

            getVariantType: (nodeId) =>
                get().nodes[nodeId]?.type ?? ('quick_reply' as VariantKey),

            // --- OPTIONS ---
            setVariantOptions: (nodeId, options) =>
                set((state) => ({
                    nodes: {
                        ...state.nodes,
                        [nodeId]: {
                            ...(state.nodes[nodeId] ?? {
                                type: 'quick_reply',
                                conditions: {},
                            }),
                            options,
                        },
                    },
                })),

            getVariantOptions: (nodeId) => get().nodes[nodeId]?.options ?? [],

            // --- CONDITIONS ---
            setVariantConditions: (nodeId, conditions) =>
                set((state) => ({
                    nodes: {
                        ...state.nodes,
                        [nodeId]: {
                            ...(state.nodes[nodeId] ?? {
                                type: 'quick_reply',
                                options: [],
                            }),
                            conditions,
                        },
                    },
                })),

            getVariantConditions: (nodeId) =>
                get().nodes[nodeId]?.conditions ?? {},

            // --- SYNC ALL ---
            setVariantAll: (nodeId, data) =>
                set((state) => ({
                    nodes: {
                        ...state.nodes,
                        [nodeId]: {
                            ...(state.nodes[nodeId] ?? {
                                type: data.type ?? 'quick_reply',
                                options: [],
                                conditions: {},
                            }),
                            ...data,
                        },
                    },
                })),

            // --- RESET ---
            resetNode: (nodeId) =>
                set((state) => {
                    const updated = { ...state.nodes }
                    delete updated[nodeId]
                    return { nodes: updated }
                }),
        }),
        {
            name: 'variant-type-session', // nombre de la clave
            storage: createJSONStorage(() => sessionStorage), // ✅ usa sessionStorage
            partialize: (state) => ({ nodes: state.nodes }),
        }
    )
)
