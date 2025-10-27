// src\store\useMySQLQueryStore.ts

'use client'

import { create } from 'zustand'

export interface MySQLQueryObject {
    mode: 'simpletext' | 'raw'
    setvar: string
    query: string
    variable: string
    alias: string
    script: string
}

interface MySQLQueryState {
    byId: Record<string, MySQLQueryObject>

    initNode: (id: string) => void
    updateField: (
        id: string,
        field: keyof MySQLQueryObject,
        value: string
    ) => void
    resetNode: (id: string) => void
    resetAll: () => void
}

export const useMySQLQueryStore = create<MySQLQueryState>((set, get) => ({
    byId: {},

    initNode: (id) =>
        set((state) => {
            if (state.byId[id]) return state
            return {
                byId: {
                    ...state.byId,
                    [id]: {
                        mode: 'simpletext',
                        setvar: '',
                        query: '',
                        variable: '',
                        alias: '',
                        script: '',
                    },
                },
            }
        }),

    updateField: (id, field, value) =>
        set((state) => {
            const cur = state.byId[id] || {}
            return {
                byId: { ...state.byId, [id]: { ...cur, [field]: value } },
            }
        }),

    resetNode: (id) =>
        set((state) => {
            const copy = { ...state.byId }
            delete copy[id]
            return { byId: copy }
        }),

    resetAll: () => set({ byId: {} }),
}))
