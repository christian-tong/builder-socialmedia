// src\store\useSwitchConditionStore.ts

'use client'
import { create } from 'zustand'

export type MatchMode = 'strict' | 'flex'

export interface SwitchConditionState {
    byId: Record<
        string,
        {
            variable: string
            alias?: string
            mode: MatchMode
            // lista de valores a evaluar (ej: ["SI","NO"])
            values: string[]
            // pares setvariables auxiliares para UI (opcional)
            setvariables: { key: string; value: string }[]
        }
    >

    initNode: (nodeId: string) => void
    setVariable: (nodeId: string, variable: string) => void
    setAlias: (nodeId: string, alias: string) => void
    setMode: (nodeId: string, mode: MatchMode) => void

    addValue: (nodeId: string, value?: string) => void
    updateValue: (nodeId: string, index: number, value: string) => void
    removeValue: (nodeId: string, index: number) => void

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
                            values: ['SI'], // valor inicial útil
                            setvariables: [{ key: '1', value: 'SI' }],
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
                return {
                    byId: {
                        ...s.byId,
                        [nodeId]: { ...cur, values: [...cur.values, value] },
                    },
                }
            }),

        updateValue: (nodeId, index, value) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const values = [...cur.values]
                values[index] = value
                return { byId: { ...s.byId, [nodeId]: { ...cur, values } } }
            }),

        removeValue: (nodeId, index) =>
            set((s) => {
                const cur = s.byId[nodeId]
                if (!cur) return s
                const values = cur.values.filter((_, i) => i !== index)
                return { byId: { ...s.byId, [nodeId]: { ...cur, values } } }
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
