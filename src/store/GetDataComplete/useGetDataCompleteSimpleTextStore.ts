// src\store\GetDataComplete\useGetDataCompleteSimpleTextStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'
import type {
    GetDataCompleteObject,
    GetDataCompleteNodeFull,
} from '@/types/getDataComplete'

interface SimpleTextStoreState {
    updatePrompt: (nodeId: string, value: string) => void
    updateSetVariable: (nodeId: string, key: string, val: string) => void
    removeSetVariable: (nodeId: string, key: string) => void
    addSetVariable: (nodeId: string) => void
    updateConditionLink: (nodeId: string, key: string, targetId: string) => void
    updateField: (
        nodeId: string,
        field:
            | 'setvar'
            | 'variable'
            | 'condition'
            | 'iterations'
            | 'timeOut'
            | 'alias',
        value: string
    ) => void
    toggleSaveHidden: (nodeId: string, checked: boolean) => void
}

/**
 * 🟠 useGetDataCompleteSimpleTextStore (v4.0 — TypeSafe + TS Fixed)
 * ------------------------------------------------------------
 * - Controla los nodos tipo SIMPLETEXT
 * - Sin errores TS ni conversiones peligrosas
 * - Soporta OptionFlowManager, setvariables y saveHidden
 */
export const useGetDataCompleteSimpleTextStore = create<SimpleTextStoreState>(
    () => ({
        /** 📝 Actualiza el prompt (texto largo principal) */
        updatePrompt: (nodeId, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown

            // 🧠 Validamos que sea un nodo con object
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const updated: GetDataCompleteObject = {
                ...node.object,
                prompt: value,
            }

            base.setNodeData(nodeId, { object: updated })
        },

        /** 💾 Añade o actualiza un setvariable */
        updateSetVariable: (nodeId, key, val) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const updated: GetDataCompleteObject = {
                ...node.object,
                setvariables: { ...node.object.setvariables, [key]: val },
            }
            base.setNodeData(nodeId, { object: updated })
        },

        /** ➕ Añade una nueva opción incremental */
        addSetVariable: (nodeId) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const keys = Object.keys(node.object.setvariables)
            const next = keys.length
                ? String(Math.max(...keys.map(Number)) + 1)
                : '0'

            const updated: GetDataCompleteObject = {
                ...node.object,
                setvariables: {
                    ...node.object.setvariables,
                    [next]: `Opción ${next}`,
                },
            }
            base.setNodeData(nodeId, { object: updated })
        },

        /** 🗑️ Elimina una opción del setvariables */
        removeSetVariable: (nodeId, key) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const newVars = { ...node.object.setvariables }
            delete newVars[key]
            const updated: GetDataCompleteObject = {
                ...node.object,
                setvariables: newVars,
            }
            base.setNodeData(nodeId, { object: updated })
        },

        /** 🔗 Vincula una opción con otro nodo */
        updateConditionLink: (nodeId, key, targetId) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const updated: GetDataCompleteObject = {
                ...node.object,
                conditions: { ...node.object.conditions, [key]: targetId },
            }
            base.setNodeData(nodeId, { object: updated })
        },

        /** 🔄 Actualiza campos genéricos (variable, alias, etc.) */
        updateField: (nodeId, field, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const updated: GetDataCompleteObject = {
                ...node.object,
                [field]: value,
            }
            base.setNodeData(nodeId, { object: updated })
        },

        /** 🟩 Cambia saveHidden (Switch estilo Bootstrap verde) */
        toggleSaveHidden: (nodeId, checked) => {
            const base = useGetDataCompleteBaseStore.getState()
            const nodeData = base.getNodeData(nodeId) as unknown
            if (
                !nodeData ||
                typeof nodeData !== 'object' ||
                !('object' in nodeData)
            )
                return

            const node = nodeData as GetDataCompleteNodeFull
            const updated: GetDataCompleteObject = {
                ...node.object,
                saveHidden: checked,
            }
            base.setNodeData(nodeId, { object: updated })
        },
    })
)
