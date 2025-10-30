// src\store\useVariantTypeStore.ts

'use client'

import { create } from 'zustand'
import type { VariantKey } from '@/config/getDataVariantsConfig'

export interface VariantNodeData {
    type: VariantKey
    options: any[]
    conditions: Record<string, string>
}

interface VariantTypeState {
    nodes: Record<string, VariantNodeData>

    // --- CRUD ---
    setVariantType: (nodeId: string, type: VariantKey) => void
    getVariantType: (nodeId: string) => VariantKey

    setVariantOptions: (nodeId: string, options: any[]) => void
    getVariantOptions: (nodeId: string) => any[]

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
 * 🧠 useVariantTypeStore (v2.5 – Extended with GETDATA + SIMPLETEXT)
 * -----------------------------------------------------------------
 * - Mantiene sincronización entre variantes QR, LIST, GETDATA y SIMPLETEXT.
 * - Asegura unicidad y coherencia de condiciones.
 * - Compatible con el sistema de handles dinámicos (MenuNode + Flow).
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

    getVariantType: (nodeId) =>
        get().nodes[nodeId]?.type ?? ('quick_reply' as VariantKey),

    /** --- Opciones --- */
    setVariantOptions: (nodeId, options) =>
        set((state) => {
            const prev = state.nodes[nodeId] ?? {
                type: 'quick_reply',
                options: [],
                conditions: {},
            }

            const currentConditions = { ...prev.conditions }

            // 🧩 Validar unicidad de postbackText dentro del nodo
            const usedKeys = new Set<string>()
            const sanitizedOptions = options.map((opt, index) => {
                let key = String(opt.postbackText ?? index)
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
                return { ...opt, postbackText: key }
            })

            // 🧹 Limpiar condiciones huérfanas
            const prevKeys = prev.options.map((o) => String(o.postbackText))
            const newKeys = sanitizedOptions.map((o) => String(o.postbackText))
            const removedKeys = prevKeys.filter((k) => !newKeys.includes(k))
            removedKeys.forEach((key) => delete currentConditions[key])

            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...prev,
                        options: sanitizedOptions,
                        conditions: currentConditions,
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
            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: { ...prev, conditions },
                },
            }
        }),

    getVariantConditions: (nodeId) => get().nodes[nodeId]?.conditions ?? {},

    /** --- Sincronización completa --- */
    setVariantAll: (nodeId, data) =>
        set((state) => ({
            nodes: {
                ...state.nodes,
                [nodeId]: {
                    type: data.type ?? 'quick_reply',
                    options: data.options ?? [],
                    conditions: data.conditions ?? {},
                },
            },
        })),

    /** --- Sincroniza store con datos reales del flujo (JSON) --- */
    syncFromFlow: (nodeId, flowData) =>
        set((state) => {
            const prev = state.nodes[nodeId] ?? {
                type: 'quick_reply',
                options: [],
                conditions: {},
            }
            return {
                nodes: {
                    ...state.nodes,
                    [nodeId]: {
                        ...prev,
                        ...flowData,
                    },
                },
            }
        }),

    /** --- Limpieza individual o global --- */
    resetNode: (nodeId) =>
        set((state) => {
            const updated = { ...state.nodes }
            delete updated[nodeId]
            return { nodes: updated }
        }),

    resetAll: () => set({ nodes: {} }),
}))

/**
 * 🔧 getVariantHandleId (v2.0)
 * -------------------------------------------------------
 * Genera el ID del handle para cada tipo de variante.
 * - QuickReply/List → usa postbackText directamente.
 * - GETDATA → usa key del setvariable (coincide con MenuNode).
 * - SIMPLETEXT → handle genérico único.
 */
export function getVariantHandleId(
    nodeId: string,
    variantType: string,
    handleId?: string | null
): string | null {
    if (!handleId) return null

    switch (variantType) {
        case 'quick_reply':
        case 'list':
            return handleId // usa el mismo postbackText

        case 'GETDATA':
            return handleId // clave del setvariable tal cual

        case 'SIMPLETEXT':
            return handleId // un solo handle (por ej. "onComplete")

        default:
            return handleId
    }
}
