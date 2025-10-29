// src/store/GetDataComplete/useGetDataCompleteQRStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'

interface QuickReplyStoreState {
    addOption: (nodeId: string) => void
    removeOption: (nodeId: string, index: number) => void
}

/**
 * 🟢 Extensión para manejar QuickReply
 */
export const useGetDataCompleteQRStore = create<QuickReplyStoreState>(() => ({
    addOption: (nodeId) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'quick_reply') return

        interactive.options.push({
            postbackText: '',
            type: 'text',
            title: '',
        })
        base.setNodeData(nodeId, { interactive })
    },

    removeOption: (nodeId, index) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'quick_reply') return

        interactive.options.splice(index, 1)
        base.setNodeData(nodeId, { interactive })
    },
}))
