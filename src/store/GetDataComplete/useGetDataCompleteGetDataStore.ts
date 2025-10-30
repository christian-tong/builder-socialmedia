// src\store\GetDataComplete\useGetDataCompleteGetDataStore.ts

'use client'

import { create } from 'zustand'
import { useGetDataCompleteBaseStore } from './useGetDataCompleteBaseStore'
import type { GetDataCompleteObject } from '@/types/getDataComplete'
import { useNodeConnections } from '@/hooks/useNodeConnections'

interface GetDataCompleteGetDataStoreState {
    /** 💬 Actualiza el prompt principal */
    updatePrompt: (nodeId: string, value: string) => void

    /** ✏️ Actualiza un campo base del objeto */
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

    /** 🔒 Alterna el estado de saveHidden */
    toggleSaveHidden: (nodeId: string, checked: boolean) => void

    /** ➕ Añade un nuevo par setvariables[key] = value */
    addSetVariable: (nodeId: string) => void

    /** ✏️ Actualiza un setvariable existente */
    updateSetVariable: (nodeId: string, key: string, value: string) => void

    /** 🗑️ Elimina un par de setvariables */
    removeSetVariable: (nodeId: string, key: string) => void

    /** 🔗 Actualiza un destino de conexión en conditions[key] y crea edge visual */
    updateConditionLink: (nodeId: string, key: string, targetId: string) => void
}

/**
 * 🟡 useGetDataCompleteGetDataStore (v2.5 — Auto Edge Sync + Safe Encode)
 * -----------------------------------------------------------------------
 * - Controla nodos tipo GETDATA (prompt, campos base, setvariables y conditions)
 * - Crea edges visuales automáticos al actualizar condiciones
 * - 100% inmutable + compatible con el patrón diferido
 */
export const useGetDataCompleteGetDataStore =
    create<GetDataCompleteGetDataStoreState>(() => ({
        /* ---------------------------------------------------------------------- */
        /* 💬 PROMPT                                                              */
        /* ---------------------------------------------------------------------- */
        updatePrompt: (nodeId, value) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            base.setNodeData(nodeId, { prompt: encodeURIComponent(value) })
            base.triggerAfterSave(nodeId)
        },

        /* ---------------------------------------------------------------------- */
        /* 🧱 CAMPOS BASE                                                          */
        /* ---------------------------------------------------------------------- */
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

        /* ---------------------------------------------------------------------- */
        /* 🔒 SAVE HIDDEN                                                          */
        /* ---------------------------------------------------------------------- */
        toggleSaveHidden: (nodeId, checked) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const updated = { ...node, saveHidden: checked }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)
        },

        /* ---------------------------------------------------------------------- */
        /* 🧩 SETVARIABLES Y CONDITIONS                                             */
        /* ---------------------------------------------------------------------- */
        addSetVariable: (nodeId) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const setvars = { ...node.setvariables }
            const nextIndex = Object.keys(setvars).length + 1
            const newKey = String(nextIndex)
            setvars[newKey] = encodeURIComponent(`Opción ${newKey}`)

            const updated = {
                ...node,
                setvariables: setvars,
                conditions: { ...node.conditions },
            }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)
        },

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

        removeSetVariable: (nodeId, key) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)
            const setvars = { ...node.setvariables }
            const conditions = { ...node.conditions }
            delete setvars[key]
            delete conditions[key]

            const updated = {
                ...node,
                setvariables: setvars,
                conditions,
            }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)
        },

        /* ---------------------------------------------------------------------- */
        /* 🔗 CONDITIONS + EDGE SYNC                                               */
        /* ---------------------------------------------------------------------- */
        updateConditionLink: (nodeId, key, targetId) => {
            const base = useGetDataCompleteBaseStore.getState()
            const node = base.getNodeData(nodeId)

            const updated = {
                ...node,
                conditions: { ...node.conditions, [key]: targetId },
            }
            base.setNodeData(nodeId, updated)
            base.triggerAfterSave(nodeId)

            // 🧭 Sincronización visual del edge
            try {
                const { createConnectionIfMissing } = useNodeConnections(nodeId)
                if (targetId) createConnectionIfMissing(targetId, key)
            } catch (err) {
                // silencioso: hooks no siempre están activos en contexto store
                console.warn('⚠️ [GetDataStore] Edge sync skipped:', err)
            }
        },
    }))
