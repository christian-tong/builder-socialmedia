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
    connections: Record<string, string> // <--- NUEVO: valor → nodo destino
}

export interface SwitchConditionState {
    byId: Record<string, SwitchConditionConfig>

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
}

export const getSwitchHandleId = (nodeId: string, value: string) =>
    `${nodeId}::switch::${encodeURIComponent(value)}`

export const useSwitchConditionStore = create<SwitchConditionState>(
    (set, get) => ({
        byId: {},

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
                            values: ['SI', 'NO'],
                            setvariables: [],
                            connections: {}, // <--- NUEVO
                        },
                    },
                }
            }),

        setVariable: (nodeId, variable) =>
            set((s) => ({
                byId: { ...s.byId, [nodeId]: { ...s.byId[nodeId], variable } },
            })),

        setAlias: (nodeId, alias) =>
            set((s) => ({
                byId: { ...s.byId, [nodeId]: { ...s.byId[nodeId], alias } },
            })),

        setMode: (nodeId, mode) =>
            set((s) => ({
                byId: { ...s.byId, [nodeId]: { ...s.byId[nodeId], mode } },
            })),

        addValue: (nodeId, value = '') =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const newValues = [...cur.values, value]
                const newConnections = { ...cur.connections, [value]: '' }
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

        updateValue: (nodeId, index, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const oldValue = cur.values[index]
                const values = [...cur.values]
                values[index] = value
                const connections = { ...cur.connections }
                if (connections[oldValue]) {
                    connections[value] = connections[oldValue]
                    delete connections[oldValue]
                }
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, values, connections },
                    },
                }
            }),

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
                                [value]: targetId,
                            },
                        },
                    },
                }
            }),

        removeConnection: (nodeId, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const connections = { ...cur.connections }
                delete connections[value]
                return {
                    byId: { ...s.byId, [nodeId]: { ...cur, connections } },
                }
            }),

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

        updateSetVar: (nodeId, index, patch) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const sv = [...cur.setvariables]
                sv[index] = { ...sv[index], ...patch }
                return {
                    byId: { ...s.byId, [nodeId]: { ...cur, setvariables: sv } },
                }
            }),

        removeSetVar: (nodeId, index) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const sv = cur.setvariables.filter((_, i) => i !== index)
                return {
                    byId: { ...s.byId, [nodeId]: { ...cur, setvariables: sv } },
                }
            }),
    })
)
