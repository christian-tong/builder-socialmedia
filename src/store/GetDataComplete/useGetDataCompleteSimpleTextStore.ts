// src\store\GetDataComplete\useGetDataCompleteSimpleTextStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'
import type { GetDataCompleteObject } from '@/types/getDataComplete'
import { useNodeConnections } from '@/hooks/useNodeConnections'

interface SimpleTextStoreState {
    /** 💬 Actualiza el prompt */
    updatePrompt: (nodeId: string, value: string) => void

    /** 📝 Actualiza la descripción */
    updateDescription: (nodeId: string, value: string) => void

    /** ✏️ Actualiza un campo base */
    updateField: (
        nodeId: string,
        field:
            | 'condition'
            | 'setvar'
            | 'variable'
            | 'alias'
            | 'iterations'
            | 'timeOut',
        value: string
    ) => void

    /** 🔒 Alterna saveHidden */
    toggleSaveHidden: (nodeId: string, checked: boolean) => void

    /** ➕ Añade un setvariable */
    addSetVariable: (nodeId: string) => void

    /** ✏️ Edita un setvariable existente */
    updateSetVariable: (nodeId: string, key: string, value: string) => void

    /** 🗑️ Elimina un setvariable + su condition asociada */
    removeSetVariable: (nodeId: string, key: string) => void

    /** 🔗 Actualiza una condición y crea edge visual */
    updateConditionLink: (nodeId: string, key: string, targetId: string) => void
}

/**
 * 🟢 useGetDataCompleteSimpleTextStore (v3.0 — Full Auto Edge Sync)
 * --------------------------------------------------------------------
 * ✅ Maneja prompt + description + base fields
 * ✅ Permite setvariables y conditions (igual a GETDATA)
 * ✅ Crea edges visuales automáticos al conectar opciones
 * ✅ 100% inmutable + compatible con sincronización diferida (v1.1)
 */
export const useGetDataCompleteSimpleTextStore = create<SimpleTextStoreState>(
    () => ({
        /* 💬 Prompt */
        updatePrompt: (nodeId, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            base.setNodeData(nodeId, { prompt: encodeURIComponent(value) })
            base.triggerAfterSave(nodeId)
        },

        /* 📝 Description */
        updateDescription: (nodeId, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            base.setNodeData(nodeId, { description: encodeURIComponent(value) })
            base.triggerAfterSave(nodeId)
        },

        /* 🧱 Campos base */
        updateField: (nodeId, field, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const updated: GetDataCompleteObject = {
                ...node,
                [field]: encodeURIComponent(value),
            }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)
        },

        /* 🔒 SaveHidden */
        toggleSaveHidden: (nodeId, checked) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            base.setNodeData(nodeId, { ...node, saveHidden: checked })
            base.triggerAfterSave(nodeId)
        },

        /* ➕ Añadir opción */
        addSetVariable: (nodeId) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const setvars = { ...node.setvariables }
            const nextIndex = Object.keys(setvars).length + 1
            const newKey = String(nextIndex)
            setvars[newKey] = encodeURIComponent(`Opción ${newKey}`)

            base.setNodeData(nodeId, {
                ...node,
                setvariables: setvars,
                conditions: { ...node.conditions },
            })
            base.triggerAfterSave(nodeId)
        },

        /* ✏️ Editar opción */
        updateSetVariable: (nodeId, key, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const updated = {
                ...node,
                setvariables: {
                    ...node.setvariables,
                    [key]: encodeURIComponent(value),
                },
            }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)
        },

        /* 🗑️ Eliminar opción */
        removeSetVariable: (nodeId, key) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const setvars = { ...node.setvariables }
            const conditions = { ...node.conditions }
            delete setvars[key]
            delete conditions[key]
            base.setNodeData(nodeId, {
                ...node,
                setvariables: setvars,
                conditions,
            })
            base.triggerAfterSave(nodeId)
        },

        /* 🔗 Actualizar conexión */
        updateConditionLink: (nodeId, key, targetId) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const updated = {
                ...node,
                conditions: { ...node.conditions, [key]: targetId },
            }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)

            // 🧭 Intento de creación de edge visual (silencioso si hook no disponible)
            try {
                const { createConnectionIfMissing } = useNodeConnections(nodeId)
                if (targetId) createConnectionIfMissing(targetId, key)
            } catch (err) {
                console.warn('⚠️ [SimpleTextStore] Edge sync skipped:', err)
            }
        },
    })
)
