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

    addSetVar: (nodeId: string, key?: string, value?: string) => void
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
/* 🧩 getSwitchHandleId (v1.2 — SafeEncoding + ConsistencyFix)    */
/* -------------------------------------------------------------- */
export const getSwitchHandleId = (nodeId: string, value: string): string => {
    const safeValue = encodeURIComponent(String(value || '').trim())
    // Estructura estándar para ReactFlow dynamic handles
    return `${nodeId}::switch::${safeValue}`
}

/* -------------------------------------------------------------- */
/* 🧠 useSwitchConditionStore (v2.7 — Dynamic Sync SetVariables)  */
/* -------------------------------------------------------------- */
export const useSwitchConditionStore = create<SwitchConditionState>(
    (set, get) => ({
        byId: {},

        /** 🆕 Inicializa nodo con “SI” */
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
                            values: ['SI'],
                            setvariables: [{ key: '1', value: 'SI' }],
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

        /** ➕ Agregar valor y mantener sync con setvariables */
        addValue: (nodeId, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const safeValue =
                    value?.trim() || `COND_${cur.values.length + 1}`
                if (cur.values.includes(safeValue)) return s

                const newValues = [...cur.values, safeValue]
                const newConnections = { ...cur.connections, [safeValue]: '' }

                // 🧠 Recalcular setvariables 1:1 con valores
                const newSetVars = newValues.map((v, i) => ({
                    key: String(i + 1),
                    value: v,
                }))

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            values: newValues,
                            connections: newConnections,
                            setvariables: newSetVars,
                        },
                    },
                }
            }),

        /** ✏️ Actualiza valor y mantiene sincronía */
        updateValue: (nodeId, index, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const oldValue = cur.values[index]
                const newValue = value?.trim() || `COND_${index + 1}`

                const values = [...cur.values]
                values[index] = newValue

                const newConnections = { ...cur.connections }
                if (newConnections[oldValue]) {
                    newConnections[newValue] = newConnections[oldValue]
                    delete newConnections[oldValue]
                }

                const newSetVars = values.map((v, i) => ({
                    key: String(i + 1),
                    value: v,
                }))

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            values,
                            connections: newConnections,
                            setvariables: newSetVars,
                        },
                    },
                }
            }),

        /** 🗑️ Elimina valor y reindexa setvariables */
        removeValue: (nodeId, index) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const val = cur.values[index]
                const newValues = cur.values.filter((_, i) => i !== index)
                const newConnections = { ...cur.connections }
                delete newConnections[val]

                const newSetVars = newValues.map((v, i) => ({
                    key: String(i + 1),
                    value: v,
                }))

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            values: newValues,
                            connections: newConnections,
                            setvariables: newSetVars,
                        },
                    },
                }
            }),

        /** 🔗 Asigna conexión y sincroniza setvariables */
        setConnection: (nodeId, value, targetId) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s

                const newConnections = {
                    ...cur.connections,
                    [value.trim()]: targetId,
                }

                // Mantener setvariables en sync con keys de connections
                const conditionKeys = Object.keys(newConnections)
                const newSetVars = conditionKeys.map((v, i) => ({
                    key: String(i + 1),
                    value: v,
                }))

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            connections: newConnections,
                            setvariables: newSetVars,
                        },
                    },
                }
            }),

        removeConnection: (nodeId, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s

                const newConnections = { ...cur.connections }
                delete newConnections[value.trim()]

                const conditionKeys = Object.keys(newConnections)
                const newSetVars = conditionKeys.map((v, i) => ({
                    key: String(i + 1),
                    value: v,
                }))

                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            connections: newConnections,
                            setvariables: newSetVars,
                        },
                    },
                }
            }),

        /** ➕ Añadir manual setvariable */
        addSetVar: (nodeId, key, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const nextKey = key || String(cur.setvariables.length + 1)
                const newSetVar = { key: nextKey, value: value ?? '' }
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: {
                            ...cur,
                            setvariables: [...cur.setvariables, newSetVar],
                        },
                    },
                }
            }),

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

        /** 🔁 Callback post-save */
        setAfterSaveCallback: (cb) => set({ onAfterSave: cb }),

        triggerAfterSave: (nodeId) => {
            const cfg = get().byId[nodeId]
            const cb = get().onAfterSave
            if (cb && cfg) cb(nodeId, cfg)
        },
    })
)
