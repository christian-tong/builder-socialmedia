// src/store/useSwitchConditionStore.ts

'use client'

import { create } from 'zustand'

export type MatchMode = 'strict' | 'flex'

export interface SwitchConditionConfig {
    variable: string
    alias?: string
    mode: MatchMode
    values: string[]
    setvariables: { key: string; value: string }[]
    connections: Record<string, string> // valor → nodo destino
}

export interface SwitchConditionState {
    byId: Record<string, SwitchConditionConfig>

    /** 🔧 Métodos base */
    initNode: (nodeId: string) => void
    setVariable: (nodeId: string, variable: string) => void
    setAlias: (nodeId: string, alias: string) => void
    setMode: (nodeId: string, mode: MatchMode) => void

    addValue: (nodeId: string, value?: string) => void
    updateValue: (nodeId: string, index: number, value: string) => void
    removeValue: (nodeId: string, index: number) => void

    setConnection: (nodeId: string, value: string, targetId: string) => void
    removeConnection: (nodeId: string, value: string) => void

    addSetVar: (nodeId: string) => void
    updateSetVar: (
        nodeId: string,
        index: number,
        patch: Partial<{ key: string; value: string }>
    ) => void
    removeSetVar: (nodeId: string, index: number) => void

    /** 🔁 Callbacks post-save */
    onAfterSave?: (nodeId: string, data: SwitchConditionConfig) => void
    setAfterSaveCallback: (
        cb: (nodeId: string, data: SwitchConditionConfig) => void
    ) => void
    triggerAfterSave: (nodeId: string) => void
}

/* -------------------------------------------------------------- */
/* 🧩 getSwitchHandleId (v1.1 — SafeEncoding + ConsistencyFix)    */
/* -------------------------------------------------------------- */
export const getSwitchHandleId = (nodeId: string, value: string): string => {
    const safeValue = encodeURIComponent(String(value).trim())
    return `${nodeId}::switch::${safeValue}`
}

/* -------------------------------------------------------------- */
/* 🧠 useSwitchConditionStore (v2.3 — AutoInit “SI”)              */
/* -------------------------------------------------------------- */
export const useSwitchConditionStore = create<SwitchConditionState>(
    (set, get) => ({
        byId: {},

        /** 🆕 Inicializa el nodo con condición base “SI” si no existe */
        initNode: (nodeId) =>
            set((s) => {
                if (s.byId[nodeId]) return s
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            variable: '',
                            alias: '',
                            mode: 'strict',
                            values: ['SI'], // 👈 condición inicial
                            setvariables: [],
                            connections: { SI: '' },
                        },
                    },
                }
            }),

        setVariable: (nodeId, variable) =>
            set((s) => ({
                byId: {
                    ...s.byId,
                    [nodeId]: { ...s.byId[nodeId], variable },
                },
            })),

        setAlias: (nodeId, alias) =>
            set((s) => ({
                byId: {
                    ...s.byId,
                    [nodeId]: { ...s.byId[nodeId], alias },
                },
            })),

        setMode: (nodeId, mode) =>
            set((s) => ({
                byId: {
                    ...s.byId,
                    [nodeId]: { ...s.byId[nodeId], mode },
                },
            })),

        /** ➕ Agregar valor y conexión (SAFE ADD) */
        addValue: (nodeId, value?: string) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s

                const safeValue =
                    value && value.trim() !== '' ? value.trim() : 'SI'

                // Evita duplicados
                if (cur.values.includes(safeValue)) return s

                const newValues = [...cur.values, safeValue]
                const newConnections = { ...cur.connections, [safeValue]: '' }

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            values: newValues,
                            connections: newConnections,
                        },
                    },
                }
            }),

        /** ✏️ Actualiza un valor y preserva conexión */
        updateValue: (nodeId, index, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s

                const oldValue = cur.values[index]
                const safeNewVal =
                    value && value.trim() !== ''
                        ? value.trim()
                        : `COND_${index + 1}`

                const values = [...cur.values]
                values[index] = safeNewVal

                const connections = { ...cur.connections }
                if (connections[oldValue]) {
                    connections[safeNewVal] = connections[oldValue]
                    delete connections[oldValue]
                }

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, values, connections },
                    },
                }
            }),

        /** 🗑️ Elimina un valor y su conexión */
        removeValue: (nodeId, index) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s

                const val = cur.values[index]
                const values = cur.values.filter((_, i) => i !== index)
                const connections = { ...cur.connections }
                delete connections[val]

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, values, connections },
                    },
                }
            }),

        /** 🔗 Asigna conexión a un valor */
        setConnection: (nodeId, value, targetId) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            connections: {
                                ...cur.connections,
                                [value.trim()]: targetId,
                            },
                        },
                    },
                }
            }),

        /** ❌ Quita conexión de un valor */
        removeConnection: (nodeId, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const connections = { ...cur.connections }
                delete connections[value.trim()]
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, connections },
                    },
                }
            }),

        /** ➕ Añadir setvariable */
        addSetVar: (nodeId) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            setvariables: [
                                ...cur.setvariables,
                                { key: '', value: '' },
                            ],
                        },
                    },
                }
            }),

        /** ✏️ Actualizar setvariable */
        updateSetVar: (nodeId, index, patch) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const sv = [...cur.setvariables]
                sv[index] = { ...sv[index], ...patch }
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, setvariables: sv },
                    },
                }
            }),

        /** 🗑️ Eliminar setvariable */
        removeSetVar: (nodeId, index) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const sv = cur.setvariables.filter((_, i) => i !== index)
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, setvariables: sv },
                    },
                }
            }),

        /** 🔁 Callbacks post-save */
        setAfterSaveCallback: (cb) => set({ onAfterSave: cb }),

        triggerAfterSave: (nodeId) => {
            const cfg = get().byId[nodeId]
            const cb = get().onAfterSave
            if (!cb || !cfg) return
            try {
                cb(nodeId, cfg)
            } catch (err) {
                console.error(
                    '❌ [SwitchConditionStore] Error onAfterSave:',
                    err
                )
            }
        },
    })
)
