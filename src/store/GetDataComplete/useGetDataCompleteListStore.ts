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

    /* ---------------------------------------------------------------------- */
    /* 🧱 Campos base del objeto principal                                    */
    /* ---------------------------------------------------------------------- */

    /** ✏️ Actualiza el valor de un campo genérico del nodo */
    updateField: (
        nodeId: string,
        field:
            | 'condition'
            | 'groodText'
            | 'setvar'
            | 'variable'
            | 'alias'
            | 'iterations'
            | 'timeOut',
        value: string
    ) => void

    /** ⚙️ Actualiza setvariables (pares clave-valor) */
    updateSetVariables: (nodeId: string, vars: Record<string, string>) => void

    /** 🧩 Alterna el valor booleano de saveHidden */
    toggleSaveHidden: (nodeId: string, value: boolean) => void
}

/**
 * 🔵 useGetDataCompleteListStore (v3.6 – Extended + saveHidden)
 * ------------------------------------------------------------
 * - Controla items, opciones, botones globales y campos base del nodo
 * - Añade manejo completo del campo booleano `saveHidden`
 */
export const useGetDataCompleteListStore = create<ListStoreState>(() => ({
    /* ---------------------------------------------------------------------- */
    /* 🧩 FUNCIONES EXISTENTES                                                 */
    /* ---------------------------------------------------------------------- */
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

    /* ---------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE DEL NODO PRINCIPAL                                       */
    /* ---------------------------------------------------------------------- */

    updateField: (nodeId, field, value) => {
        const base = useGetDataCompleteBaseStore.getState()
        const current: GetDataCompleteObject = base.getNodeData(nodeId)
        if (!current) return

        const updated: GetDataCompleteObject = {
            ...current,
            [field]: value,
        }

        base.setNodeData(nodeId, updated)
    },

    updateSetVariables: (nodeId, vars) => {
        const base = useGetDataCompleteBaseStore.getState()
        const current: GetDataCompleteObject = base.getNodeData(nodeId)
        if (!current) return

        const updated: GetDataCompleteObject = {
            ...current,
            setvariables: { ...vars },
        }

        base.setNodeData(nodeId, updated)
    },

    toggleSaveHidden: (nodeId, value) => {
        const base = useGetDataCompleteBaseStore.getState()
        const current: GetDataCompleteObject = base.getNodeData(nodeId)
        if (!current) return

        const updated: GetDataCompleteObject = {
            ...current,
            saveHidden: value,
        }

        base.setNodeData(nodeId, updated)
    },
}))
