// src/store/GetDataComplete/useGetDataCompleteListStore.ts

'use client'

import { create } from 'zustand'
import { GetDataCompleteObject } from '@/types/getDataComplete'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'

interface ListStoreState {
    addListItem: (nodeId: string, title?: string) => void
    addOption: (nodeId: string, itemIndex: number) => void
    removeOption: (
        nodeId: string,
        itemIndex: number,
        optionIndex: number
    ) => void
}

/**
 * 🔵 Extensión para manejar comportamiento tipo List
 */
export const useGetDataCompleteListStore = create<ListStoreState>(() => ({
    addListItem: (nodeId, title = 'Elija una opción') => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        interactive.items.push({ title, options: [] })
        base.setNodeData(nodeId, { interactive })
    },

    addOption: (nodeId, itemIndex) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        interactive.items[itemIndex].options.push({
            postbackText: '',
            type: 'text',
            title: '',
        })
        base.setNodeData(nodeId, { interactive })
    },

    removeOption: (nodeId, itemIndex, optionIndex) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        interactive.items[itemIndex].options.splice(optionIndex, 1)
        base.setNodeData(nodeId, { interactive })
    },
}))
