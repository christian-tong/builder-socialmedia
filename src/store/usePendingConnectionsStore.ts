// src\store\usePendingConnectionsStore.ts

'use client'

import { create } from 'zustand'

export interface PendingConn {
    sourceId: string
    handleId?: string // onTrue | onFalse | onError | optionKey
    targetId: string | '' // '' = ninguno
}

interface PendingConnectionsState {
    draftsBySource: Record<string, PendingConn[]>
    setDraft: (
        sourceId: string,
        handleId: string | undefined,
        targetId: string
    ) => void
    clearSource: (sourceId: string) => void
    getSourceDrafts: (sourceId: string) => PendingConn[]
}

export const usePendingConnectionsStore = create<PendingConnectionsState>(
    (set, get) => ({
        draftsBySource: {},

        setDraft: (sourceId, handleId, targetId) => {
            set((state) => {
                const list = state.draftsBySource[sourceId] ?? []
                // quita si ya existía para ese handle
                const filtered = list.filter((d) => d.handleId !== handleId)
                const next = [...filtered, { sourceId, handleId, targetId }]
                return {
                    draftsBySource: {
                        ...state.draftsBySource,
                        [sourceId]: next,
                    },
                }
            })
        },

        clearSource: (sourceId) => {
            set((state) => {
                const cpy = { ...state.draftsBySource }
                delete cpy[sourceId]
                return { draftsBySource: cpy }
            })
        },

        getSourceDrafts: (sourceId) => get().draftsBySource[sourceId] ?? [],
    })
)
