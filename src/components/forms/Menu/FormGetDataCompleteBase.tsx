// src/components/forms/Menu/FormGetDataCompleteBase.tsx

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
 * 🧩 FormGetDataCompleteBase (v4.7 — AutoVariantSync)
 * -------------------------------------------------------------------------
 * ✅ Detecta automáticamente tipo importado (GETDATA / SIMPLETEXT / List / QR)
 * ✅ Compatible con convertWiContactToFlow v5.4
 * ✅ Sincroniza Select inicial con variantStore y JSON importado
 * ✅ Mantiene lógica de conexión y guardado diferido
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

            const type =
                (current.type as string)?.toUpperCase?.() ||
                (current.interactive?.type as string)?.toUpperCase?.() ||
                'QUICK_REPLY'

            // 💬 QUICK_REPLY → crea edges por opción
            if (type === 'QUICK_REPLY' && current.interactive) {
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
            if (type === 'LIST' && current.interactive) {
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
            if (type === 'GETDATA' || type === 'SIMPLETEXT') {
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
        handleChange('type', value)
    }

    /* -------------------------------------------------------------------------- */
    /* 🧠 Detección automática del tipo inicial                                   */
    /* -------------------------------------------------------------------------- */
    const type =
        (localData.type as string)?.toUpperCase?.() ||
        (localData.interactive?.type as string)?.toUpperCase?.() ||
        'QUICK_REPLY'

    /* -------------------------------------------------------------------------- */
    /* 🎨 Conexiones condicionales                                                */
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

            {/* 🔗 Nodo anterior */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* ⚡ Nodos siguientes */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="next-nodes">
                        <AccordionTrigger className="rounded-md bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/10 dark:text-purple-300">
                            ⚡ Nodos siguientes (Centro de Control)
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4 px-2 pt-2">
                            {/* OnTrue */}
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

                            {/* OnFalse */}
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

                            {/* OnError */}
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
                            <SelectItem value="QUICK_REPLY">
                                💬 Quick Reply
                            </SelectItem>
                            <SelectItem value="LIST">📋 List</SelectItem>
                            <SelectItem value="GETDATA">🧾 GetData</SelectItem>
                            <SelectItem value="SIMPLETEXT">
                                🗒️ Simple Text
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 🧱 Formularios dinámicos */}
            {type === 'QUICK_REPLY' && <FormGetDataCompleteQR id={id} />}
            {type === 'LIST' && <FormGetDataCompleteList id={id} />}
            {type === 'GETDATA' && <FormGetDataCompleteGetData id={id} />}
            {type === 'SIMPLETEXT' && <FormGetDataCompleteSimpleText id={id} />}
        </div>
    )
}
