// src/store/GetDataComplete/useGetDataCompleteListStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'
import type {
    GetDataCompleteObject,
    ListInteractive,
    ListItem,
    ListOption,
    GlobalButton,
} from '@/types/getDataComplete'

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
 * 🔵 useGetDataCompleteListStore (v2.2 – Fully Typed)
 * ------------------------------------------------------------
 * - Maneja items, options y globalButtons del tipo ListInteractive
 * - Sincroniza con useGetDataCompleteBaseStore
 * - Tipado completo con seguridad ante nodos inexistentes o tipo inválido
 */
export const useGetDataCompleteListStore = create<ListStoreState>(() => ({
    /** 🧱 Añade un nuevo bloque de opciones */
    addListItem: (nodeId, title = 'Elija una opción') => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as ListInteractive | undefined
        if (!interactive || interactive.type !== 'list') return

        const updated: ListInteractive = {
            ...interactive,
            items: [...interactive.items, { title, options: [] }],
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🧱 Añade una nueva opción dentro de un bloque */
    addOption: (nodeId, itemIndex) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as ListInteractive | undefined
        if (!interactive || interactive.type !== 'list') return

        const updatedItems: ListItem[] = [...interactive.items]
        const targetItem = updatedItems[itemIndex]
        if (!targetItem) return

        const newOption: ListOption = {
            postbackText: '',
            type: 'text',
            title: '',
        }

        updatedItems[itemIndex] = {
            ...targetItem,
            options: [...targetItem.options, newOption],
        }

        const updated: ListInteractive = { ...interactive, items: updatedItems }
        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🗑️ Elimina una opción dentro de un bloque */
    removeOption: (nodeId, itemIndex, optionIndex) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as ListInteractive | undefined
        if (!interactive || interactive.type !== 'list') return

        const updatedItems: ListItem[] = [...interactive.items]
        const targetItem = updatedItems[itemIndex]
        if (!targetItem) return

        updatedItems[itemIndex] = {
            ...targetItem,
            options: targetItem.options.filter((_, i) => i !== optionIndex),
        }

        const updated: ListInteractive = { ...interactive, items: updatedItems }
        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🔘 Añade un nuevo botón global */
    addGlobalButton: (nodeId, title = '') => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as ListInteractive | undefined
        if (!interactive || interactive.type !== 'list') return

        const newButton: GlobalButton = { type: 'text', title }

        const updated: ListInteractive = {
            ...interactive,
            globalButtons: [...(interactive.globalButtons || []), newButton],
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** 🗑️ Elimina un botón global */
    removeGlobalButton: (nodeId, index) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as ListInteractive | undefined
        if (!interactive || interactive.type !== 'list') return

        const updated: ListInteractive = {
            ...interactive,
            globalButtons: (interactive.globalButtons || []).filter(
                (_, i) => i !== index
            ),
        }

        base.setNodeData(nodeId, { interactive: updated })
    },

    /** ✏️ Actualiza título de un botón global */
    updateGlobalButtonTitle: (nodeId, index, title) => {
        const base = useGetDataCompleteBaseStore.getState()
        const node: GetDataCompleteObject = base.getNodeData(nodeId)
        const interactive = node.interactive as ListInteractive | undefined
        if (!interactive || interactive.type !== 'list') return

        const updatedButtons = [...(interactive.globalButtons || [])]
        if (updatedButtons[index]) {
            updatedButtons[index].title = title
        }

        const updated: ListInteractive = {
            ...interactive,
            globalButtons: updatedButtons,
        }

        base.setNodeData(nodeId, { interactive: updated })
    },
}))
