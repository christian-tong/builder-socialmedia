// src/components/forms/Menu/FormGetDataCompleteBase.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label, Badge } from '@/components/ui'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
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
 * 🧩 FormGetDataCompleteBase (v4.6 — Acordeón Centro de Control)
 * -------------------------------------------------------------------------
 * - Agrupa onTrue / onFalse / onError en un acordeón “Centro de Control”
 * - Mantiene compatibilidad con QuickReply, List, GETDATA, SimpleText
 * - Conserva el patrón de sincronización diferida y estructura estándar
 */
export default function FormGetDataCompleteBase({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, onAfterSave } =
        useGetDataCompleteBaseStore()
    const {
        createConnectionIfMissing,
        prevNodes,
        availableNodes,
        hasConnection,
        toggleConnection,
    } = useNodeConnections(id)

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

    /* -------------------------------------------------------------------------- */
    /* 💾 Callback de guardado diferido                                          */
    /* -------------------------------------------------------------------------- */
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
    /* 🔄 Cambio de tipo interactivo dinámico                                     */
    /* -------------------------------------------------------------------------- */
    const handleInteractiveTypeChange = (
        value: 'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT'
    ) => {
        const interactive = createEmptyInteractive(value)
        handleChange('interactive', interactive)
    }

    const type = localData.interactive?.type || 'quick_reply'

    /* -------------------------------------------------------------------------- */
    /* 🎨 Conexiones condicionales (siguiendo patrón FormTimeConditionNode)       */
    /* -------------------------------------------------------------------------- */
    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.data?.label || n.id)
    const falseConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onFalse'))
        .map((n) => n.data?.label || n.id)
    const errorConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onError'))
        .map((n) => n.data?.label || n.id)

    /* -------------------------------------------------------------------------- */
    /* 🧱 Render                                                                  */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                    Configuración GetDataComplete
                </Label>
                <Badge
                    variant="outline"
                    className="border-purple-300 bg-purple-50 px-2 py-0.5 text-[10px] text-purple-800 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Conexión entrante */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* ⚙️ Nodos siguientes (Centro de Control) */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="next-nodes">
                        <AccordionTrigger className="rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/10 dark:text-purple-300">
                            ⚡ Nodos siguientes (Centro de Control)
                        </AccordionTrigger>

                        <AccordionContent className="space-y-4 px-2 pt-2">
                            {/* ⚡ Sección OnTrue */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Conexión OnTrue
                                </Label>
                                <NodeConnectionsAccordion
                                    title="Nodos conectados (onTrue)"
                                    nodesList={trueConnections}
                                    accentColor="text-green-700 dark:text-green-300"
                                />
                                <NodeSelectionAccordion
                                    title="Seleccionar nodo OnTrue"
                                    availableNodes={availableNodes}
                                    hasConnection={hasConnection}
                                    toggleConnection={toggleConnection}
                                    handleId="onTrue"
                                    accentColor="text-green-700 dark:text-green-300"
                                />
                            </div>

                            {/* ⚡ Sección OnFalse */}
                            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                                <Label className="text-sm font-medium text-rose-600 dark:text-rose-400">
                                    Conexión OnFalse
                                </Label>
                                <NodeConnectionsAccordion
                                    title="Nodos conectados (onFalse)"
                                    nodesList={falseConnections}
                                    accentColor="text-rose-700 dark:text-rose-300"
                                />
                                <NodeSelectionAccordion
                                    title="Seleccionar nodo OnFalse"
                                    availableNodes={availableNodes}
                                    hasConnection={hasConnection}
                                    toggleConnection={toggleConnection}
                                    handleId="onFalse"
                                    accentColor="text-rose-700 dark:text-rose-300"
                                />
                            </div>

                            {/* ⚡ Sección OnError */}
                            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                                <Label className="text-sm font-medium text-amber-600 dark:text-amber-400">
                                    Conexión OnError
                                </Label>
                                <NodeConnectionsAccordion
                                    title="Nodos conectados (onError)"
                                    nodesList={errorConnections}
                                    accentColor="text-amber-700 dark:text-amber-300"
                                />
                                <NodeSelectionAccordion
                                    title="Seleccionar nodo OnError"
                                    availableNodes={availableNodes}
                                    hasConnection={hasConnection}
                                    toggleConnection={toggleConnection}
                                    handleId="onError"
                                    accentColor="text-amber-700 dark:text-amber-300"
                                />
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* ⚙️ Configuración general */}
            <div className="space-y-3 border-t pt-3 dark:border-gray-800">
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
