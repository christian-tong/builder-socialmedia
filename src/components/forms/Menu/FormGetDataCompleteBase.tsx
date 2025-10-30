// src/components/forms/Menu/FormGetDataCompleteBase.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'
import { NodeFlowConnectionsManager } from '@/components/shared/NodeFlowConnectionsManager'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    createEmptyInteractive,
    type GetDataCompleteObject,
} from '@/types/getDataComplete'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { FormGetDataCompleteQR } from './FormGetDataCompleteQR'
import { FormGetDataCompleteList } from './FormGetDataCompleteList'
import { FormGetDataCompleteSimpleText } from './FormGetDataCompleteSimpleText'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { FormGetDataCompleteGetData } from './FormGetDataCompleteGetData'

/**
 * 🧩 FormGetDataCompleteBase (v4.3 — Full Edge Sync: QR + LIST + GETDATA)
 * -------------------------------------------------------------------------
 * - Soporta QuickReply, List, GETDATA y SIMPLETEXT
 * - Crea automáticamente edges para GETDATA igual que QR/List
 * - Mantiene patrón de sincronización diferida
 */
export default function FormGetDataCompleteBase({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, onAfterSave } =
        useGetDataCompleteBaseStore()
    const { createConnectionIfMissing, prevNodes, availableNodes } =
        useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<GetDataCompleteObject>>(
        {}
    )

    /* -------------------------------------------------------------------------- */
    /* 🧠 Inicialización y carga local                                            */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        initNode(id)
        setLocalData(getNodeData(id))
    }, [id])

    useEffect(() => {
        const saveFn = () => {
            const current = getNodeData(id)
            setNodeData(id, current)
            updateNodeData(id, { ...data, object: current })

            const type = current.interactive?.type

            // 💬 QUICK_REPLY → crea edges por opción
            if (type === 'quick_reply' && current.interactive) {
                const qr = current.interactive
                if ('options' in qr && Array.isArray(qr.options)) {
                    qr.options.forEach((opt) => {
                        if (opt.nextNodeId) {
                            createConnectionIfMissing(
                                opt.nextNodeId,
                                opt.postbackText
                            )
                        }
                    })
                }
            }

            // 📋 LIST → crea edges según items[].options[].nextNodeId
            if (type === 'list' && current.interactive) {
                const list = current.interactive
                if ('items' in list && Array.isArray(list.items)) {
                    list.items.forEach((item) => {
                        item.options?.forEach((opt) => {
                            if ((opt as any).nextNodeId) {
                                createConnectionIfMissing(
                                    (opt as any).nextNodeId,
                                    opt.postbackText
                                )
                            }
                        })
                    })
                }
            }

            // 🧾 GETDATA → crea edges por cada condición válida
            if (type === 'GETDATA') {
                const conditions = current.conditions || {}
                Object.entries(conditions).forEach(([key, targetId]) => {
                    if (targetId)
                        createConnectionIfMissing(targetId as string, key)
                })
            }

            onAfterSave?.(id, current)
        }

        registerSaveCallback(id, saveFn)
        return () => unregisterSaveCallback(id)
    }, [
        id,
        registerSaveCallback,
        unregisterSaveCallback,
        setNodeData,
        updateNodeData,
    ])

    /* -------------------------------------------------------------------------- */
    /* ✏️ Edición local                                                          */
    /* -------------------------------------------------------------------------- */
    const handleChange = (field: keyof GetDataCompleteObject, value: any) => {
        setLocalData((prev) => {
            const updated = { ...prev, [field]: value }
            setNodeData(id, updated)
            return updated
        })
    }

    /* -------------------------------------------------------------------------- */
    /* 🧩 Cambio de tipo interactivo dinámico                                     */
    /* -------------------------------------------------------------------------- */
    const handleInteractiveTypeChange = (
        value: 'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT'
    ) => {
        const interactive = createEmptyInteractive(value)
        handleChange('interactive', interactive)
    }

    const type = localData.interactive?.type || 'quick_reply'

    /* -------------------------------------------------------------------------- */
    /* 🧱 Render                                                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="flex flex-col gap-6">
            {/* 🔗 Conexiones principales */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-purple-600"
            />

            <NodeFlowConnectionsManager
                id={id}
                data={data}
                availableNodes={availableNodes}
                updateNodeData={updateNodeData}
                connections={['onTrue', 'onFalse', 'onError']}
                accentColor="text-purple-600"
                deferred
            />

            {/* ⚙️ Configuración general */}
            <div className="space-y-3">
                <div className="pt-2">
                    <Label className="mb-1 block text-sm font-medium">
                        Tipo interactivo
                    </Label>
                    <Select
                        value={type}
                        onValueChange={handleInteractiveTypeChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="quick_reply">
                                💬 Quick Reply
                            </SelectItem>
                            <SelectItem value="list">📋 List</SelectItem>
                            <SelectItem value="GETDATA">🧾 GetData</SelectItem>
                            <SelectItem value="SIMPLETEXT">
                                🗒️ Simple Text
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 🧱 Formularios dinámicos según tipo */}
            {type === 'quick_reply' && <FormGetDataCompleteQR id={id} />}
            {type === 'list' && <FormGetDataCompleteList id={id} />}
            {type === 'GETDATA' && <FormGetDataCompleteGetData id={id} />}
            {type === 'SIMPLETEXT' && <FormGetDataCompleteSimpleText id={id} />}
        </div>
    )
}
