// src\store\useVariantTypeStore.ts

'use client'

import { create } from 'zustand'
import type { VariantKey } from '@/config/getDataVariantsConfig'

export interface VariantOption {
    postbackText: string
    title: string
    description?: string
    type?: string
    nextNodeId?: string
}

export interface VariantNodeData {
    type: VariantKey
    options: VariantOption[]
    conditions: Record<string, string>
}

interface VariantTypeState {
    nodes: Record<string, VariantNodeData>

    // --- CRUD ---
    setVariantType: (nodeId: string, type: VariantKey) => void
    getVariantType: (nodeId: string) => VariantKey | undefined

    setVariantOptions: (nodeId: string, options: VariantOption[]) => void
    getVariantOptions: (nodeId: string) => VariantOption[]

    setVariantConditions: (
        nodeId: string,
        conditions: Record<string, string>
    ) => void
    getVariantConditions: (nodeId: string) => Record<string, string>

    // --- Sincronización completa ---
    setVariantAll: (nodeId: string, data: Partial<VariantNodeData>) => void
    syncFromFlow: (nodeId: string, flowData: any) => void

    // --- Limpieza ---
    resetNode: (nodeId: string) => void
    resetAll: () => void
}

/**
 * 🧠 useVariantTypeStore (v2.8 – Integrated & Stable)
 * ------------------------------------------------------------------
 * ✅ Sincroniza automáticamente conditions a partir de nextNodeId
 * ✅ Corrige duplicados en postbackText y limpia claves huérfanas
 * ✅ Compatible con List / QuickReply / GETDATA / SIMPLETEXT
 * ✅ Preparado para uso con generateConversationJson (v7.x)
 */
export const useVariantTypeStore = create<VariantTypeState>((set, get) => ({
    nodes: {},

    /** --- Tipo de variante --- */
    setVariantType: (nodeId, type) =>
        set((state) => {
            const prev = state.nodes[nodeId] ?? {
                type,
                options: [],
                conditions: {},
            }
            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: { ...prev, type },
                },
            }
        }),

    getVariantType: (nodeId) => get().nodes[nodeId]?.type,

    /** --- Opciones --- */
    setVariantOptions: (nodeId, options) =>
        set((state) => {
            const prev = state.nodes[nodeId] ?? {
                type: 'quick_reply',
                options: [],
                conditions: {},
            }

            // Clonar condiciones previas
            const updatedConditions = { ...prev.conditions }
            const usedKeys = new Set<string>()

            // 🧩 Normalizar y sincronizar
            const sanitizedOptions = options.map((opt, index) => {
                let key = String(opt.postbackText ?? index + 1)
                if (usedKeys.has(key)) {
                    const base = key.replace(/-\d+$/, '')
                    let counter = 2
                    while (usedKeys.has(`${base}-${counter}`)) counter++
                    key = `${base}-${counter}`
                    console.warn(
                        `[useVariantTypeStore] ⚠️ postbackText duplicado corregido: '${opt.postbackText}' → '${key}'`
                    )
                }
                usedKeys.add(key)

                // 🔄 Sincronizar condición (nextNodeId)
                if (opt.nextNodeId && opt.nextNodeId.trim() !== '') {
                    updatedConditions[key] = opt.nextNodeId
                }

                return { ...opt, postbackText: key }
            })

            // 🧹 Limpiar condiciones huérfanas
            const validKeys = sanitizedOptions.map((o) => o.postbackText)
            Object.keys(updatedConditions).forEach((key) => {
                if (!validKeys.includes(key)) delete updatedConditions[key]
            })

            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...prev,
                        options: sanitizedOptions,
                        conditions: updatedConditions,
                    },
                },
            }
        }),

    getVariantOptions: (nodeId) => get().nodes[nodeId]?.options ?? [],

    /** --- Conditions --- */
    setVariantConditions: (nodeId, conditions) =>
        set((state) => {
            const prev = state.nodes[nodeId] ?? {
                type: 'quick_reply',
                options: [],
                conditions: {},
            }

            // 🔄 Sincronizar con opciones existentes
            const syncedOptions = prev.options.map((opt) => {
                const nextNodeId = conditions[opt.postbackText]
                return { ...opt, nextNodeId }
            })

            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: { ...prev, conditions, options: syncedOptions },
                },
            }
        }),

    getVariantConditions: (nodeId) => get().nodes[nodeId]?.conditions ?? {},

    /** --- Sincronización completa (desde flujo) --- */
    setVariantAll: (nodeId, data) =>
        set((state) => {
            const mergedConditions = { ...(data.conditions ?? {}) }
            const mergedOptions = (data.options ?? []).map((o) => ({
                ...o,
                nextNodeId:
                    o.nextNodeId ?? mergedConditions[o.postbackText] ?? '',
            }))
            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        type: data.type ?? 'quick_reply',
                        options: mergedOptions,
                        conditions: mergedConditions,
                    },
                },
            }
        }),

    /** --- Sincroniza con importaciones del flujo --- */
    syncFromFlow: (nodeId, flowData) =>
        set((state) => {
            const prev = state.nodes[nodeId] ?? {
                type: 'quick_reply',
                options: [],
                conditions: {},
            }

            const options = flowData?.options ?? prev.options
            const conditions = flowData?.conditions ?? prev.conditions

            // Vincular condiciones con nextNodeId
            const syncedOptions = options.map((opt: any) => ({
                ...opt,
                nextNodeId:
                    opt.nextNodeId ?? conditions[opt.postbackText] ?? '',
            }))

            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: { ...prev, ...flowData, options: syncedOptions },
                },
            }
        }),

    /** --- Limpieza --- */
    resetNode: (nodeId) =>
        set((state) => {
            const updated = { ...state.nodes }
            delete updated[nodeId]
            return { nodes: updated }
        }),

    resetAll: () => set({ nodes: {} }),
}))

/**
 * 🔧 getVariantHandleId (v2.1)
 * -------------------------------------------------------
 * Genera el ID del handle para cada tipo de variante.
 */
export function getVariantHandleId(
    nodeId: string,
    variantType: string,
    handleId?: string | null
): string | null {
    if (!handleId) return null
    return handleId
}
