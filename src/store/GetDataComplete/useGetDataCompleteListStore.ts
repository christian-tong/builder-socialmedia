// src/store/GetDataComplete/useGetDataCompleteListStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'

interface ListStoreState {
    /** ➕ Añade un nuevo grupo (ListItem) */
    addListItem: (nodeId: string, title?: string) => void

    /** ➕ Añade una nueva opción dentro de un grupo */
    addOption: (nodeId: string, itemIndex: number) => void

    /** 🗑️ Elimina una opción específica */
    removeOption: (
        nodeId: string,
        itemIndex: number,
        optionIndex: number
    ) => void

    /** 🔘 Añade un botón global */
    addGlobalButton: (nodeId: string, title?: string) => void

    /** 🗑️ Elimina un botón global por índice */
    removeGlobalButton: (nodeId: string, index: number) => void

    /** ✏️ Actualiza el título de un botón global */
    updateGlobalButtonTitle: (
        nodeId: string,
        index: number,
        title: string
    ) => void
}

/**
 * 🔵 useGetDataCompleteListStore (v2.1 Extended)
 * ------------------------------------------------------------
 * - Maneja items, options y globalButtons del tipo ListInteractive
 * - Mantiene sincronización con useGetDataCompleteBaseStore
 * - Mutaciones seguras (inmutables y consistentes)
 */
export const useGetDataCompleteListStore = create<ListStoreState>(() => ({
    /** 🧱 Añade un nuevo bloque de opciones */
    addListItem: (nodeId, title = 'Elija una opción') => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        interactive.items = [...interactive.items, { title, options: [] }]
        base.setNodeData(nodeId, { interactive })
    },

    /** 🧱 Añade una nueva opción dentro del bloque */
    addOption: (nodeId, itemIndex) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        const updated = { ...interactive }
        updated.items = [...interactive.items]
        updated.items[itemIndex] = {
            ...interactive.items[itemIndex],
            options: [
                ...interactive.items[itemIndex].options,
                { postbackText: '', type: 'text', title: '' },
            ],
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🗑️ Elimina una opción dentro de un bloque */
    removeOption: (nodeId, itemIndex, optionIndex) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        const updated = { ...interactive }
        updated.items = [...interactive.items]
        updated.items[itemIndex] = {
            ...interactive.items[itemIndex],
            options: interactive.items[itemIndex].options.filter(
                (_, i) => i !== optionIndex
            ),
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🔘 Añade un nuevo botón global */
    addGlobalButton: (nodeId, title = '') => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        const updated = { ...interactive }
        updated.globalButtons = [
            ...(interactive.globalButtons || []),
            { type: 'text', title },
        ]

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🗑️ Elimina un botón global */
    removeGlobalButton: (nodeId, index) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        const updated = { ...interactive }
        updated.globalButtons = (interactive.globalButtons || []).filter(
            (_, i) => i !== index
        )

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** ✏️ Actualiza título de un botón global */
    updateGlobalButtonTitle: (nodeId, index, title) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node = base.getNodeData(nodeId)
        const interactive = node.interactive
        if (interactive.type !== 'list') return

        const updated = { ...interactive }
        updated.globalButtons = [...(interactive.globalButtons || [])]
        if (updated.globalButtons[index]) {
            updated.globalButtons[index].title = title
        }

        base.setNodeData(nodeId, { interactive: updated })
    },
}))
