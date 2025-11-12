// src/components/forms/Menu/FormGetDataCompleteBase.tsx

'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Label, Badge, Input, Button } from '@/components/ui'
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

import { useFlowChannelStore } from '@/store/useFlowChannelStore'
import {
    FLOW_CHANNEL_CAPABILITIES,
    type InteractiveType,
} from '@/config/flowChannelCapabilities'
import { FlowChannelEnum } from '@/config/flowChannelsConfig'

/**
 * 🧩 FormGetDataCompleteBase (v5.3 — Validación de canal)
 * -------------------------------------------------------------------------
 * ✅ Detecta canal actual (WhatsApp / ChatWeb)
 * ✅ Filtra tipos interactivos según canal
 * ✅ Mantiene toda la lógica del acordeón original
 * ✅ Muestra advertencia si el tipo no pertenece al canal actual
 * ✅ Permite cambiar canal desde el mismo formulario
 */
export default function FormGetDataCompleteBase({ id, data }: any) {
    const { channel, setChannel } = useFlowChannelStore()
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, onAfterSave } =
        useGetDataCompleteBaseStore()

    const {
        createConnectionIfMissing,
        prevNodes,
        availableNodes,
        hasConnection,
        toggleConnection: baseToggleConnection,
    } = useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<GetDataCompleteObject>>(
        {}
    )

    /* -------------------------------------------------------------------------- */
    /* 🧠 Inicialización                                                          */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        initNode(id)
        setLocalData(getNodeData(id))
    }, [id])

    /* -------------------------------------------------------------------------- */
    /* ⚙️ Tipos disponibles por canal                                             */
    /* -------------------------------------------------------------------------- */
    const allowedTypes = useMemo(() => {
        if (!channel) return []
        const caps = FLOW_CHANNEL_CAPABILITIES[channel as FlowChannelEnum]
        return caps?.allowedInteractiveTypes || []
    }, [channel])

    /* -------------------------------------------------------------------------- */
    /* 🔄 Cambio de tipo interactivo                                              */
    /* -------------------------------------------------------------------------- */
    const handleInteractiveTypeChange = (
        value: 'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT'
    ) => {
        const normalizedValue = value.toLowerCase() as
            | 'quick_reply'
            | 'list'
            | 'GETDATA'
            | 'SIMPLETEXT'

        const interactive = createEmptyInteractive(normalizedValue)
        setLocalData((prev): Partial<GetDataCompleteObject> => {
            const updated: Partial<GetDataCompleteObject> = {
                ...prev,
                interactive,
                type: normalizedValue,
            }
            setNodeData(id, updated)
            return updated
        })
    }

    /* -------------------------------------------------------------------------- */
    /* 🔁 Wrapper toggleConnection extendido                                      */
    /* -------------------------------------------------------------------------- */
    const toggleConnection = (
        nodeId: string,
        checked: boolean,
        handleId?: string
    ) => {
        baseToggleConnection(nodeId, checked, handleId)

        if (checked && handleId === 'onFalse') {
            const hasTimeOut = availableNodes.some((n) =>
                hasConnection(n.id, 'onTimeOut')
            )
            if (!hasTimeOut) baseToggleConnection(nodeId, true, 'onTimeOut')
        }

        if (checked && handleId === 'onError') {
            const hasTimeOutError = availableNodes.some((n) =>
                hasConnection(n.id, 'onTimeOutError')
            )
            if (!hasTimeOutError)
                baseToggleConnection(nodeId, true, 'onTimeOutError')
        }
    }

    /* -------------------------------------------------------------------------- */
    /* 💾 Guardado diferido                                                      */
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
                        if (opt.nextNodeId)
                            createConnectionIfMissing(
                                opt.nextNodeId,
                                opt.postbackText
                            )
                    })
                }
            }

            // 📋 LIST → crea edges según items[].options[].nextNodeId
            if (type === 'LIST' && current.interactive) {
                const list = current.interactive
                if ('items' in list && Array.isArray(list.items)) {
                    list.items.forEach((item) => {
                        item.options?.forEach((opt) => {
                            if ((opt as any).nextNodeId)
                                createConnectionIfMissing(
                                    (opt as any).nextNodeId,
                                    opt.postbackText
                                )
                        })
                    })
                }
            }

            // 🧾 GETDATA / SIMPLETEXT → crea edges por condiciones
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
    /* 🧠 Tipo actual detectado                                                   */
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
    const timeOutConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTimeOut'))
        .map((n) => n.data?.label || n.id)
    const timeOutErrorConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTimeOutError'))
        .map((n) => n.data?.label || n.id)

    /* -------------------------------------------------------------------------- */
    /* 🧱 Render                                                                  */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-end justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-purple-600 dark:text-purple-300">
                    Configuración Captura de Datos
                </Label>
                <div className="flex flex-col gap-2">
                    <Badge
                        variant="outline"
                        className="border-purple-300 bg-purple-50 px-2 py-0.5 text-[10px] text-purple-800 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                    >
                        {channel ? channel.toUpperCase() : 'SIN CANAL'}
                    </Badge>
                    <Badge
                        variant="outline"
                        className="border-zinc-500 px-2 py-0.5 text-[10px] text-zinc-500"
                    >
                        {id}
                    </Badge>
                </div>
            </div>

            {/* 🔗 Nodo anterior */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* ⚙️ Tipo interactivo */}
            <div className="space-y-3 border-t pt-3 dark:border-gray-800">
                <Label className="mb-1 block text-sm font-medium">
                    Tipo interactivo
                </Label>
                <Select
                    value={type}
                    onValueChange={(val) =>
                        handleInteractiveTypeChange(
                            val as
                                | 'quick_reply'
                                | 'list'
                                | 'GETDATA'
                                | 'SIMPLETEXT'
                        )
                    }
                >
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                        {allowedTypes.includes('quick_reply') && (
                            <SelectItem value="QUICK_REPLY">
                                💬 Quick Reply
                            </SelectItem>
                        )}
                        {allowedTypes.includes('list') && (
                            <SelectItem value="LIST">📋 List</SelectItem>
                        )}
                        {allowedTypes.includes('GETDATA') && (
                            <SelectItem value="GETDATA">🧾 GetData</SelectItem>
                        )}
                        {allowedTypes.includes('SIMPLETEXT') && (
                            <SelectItem value="SIMPLETEXT">
                                🗒️ Simple Text
                            </SelectItem>
                        )}
                    </SelectContent>
                </Select>
            </div>

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
                                    Conexión trueStep
                                </Label>
                                <NodeConnectionsAccordion
                                    title="Nodos conectados (trueStep)"
                                    nodesList={trueConnections}
                                    accentColor="text-green-700 dark:text-green-300"
                                />
                                <NodeSelectionAccordion
                                    title="Seleccionar nodo trueStep"
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
                                    Conexión falseStep
                                </Label>
                                <NodeConnectionsAccordion
                                    title="Nodos conectados (falseStep)"
                                    nodesList={falseConnections}
                                    accentColor="text-rose-700 dark:text-rose-300"
                                />
                                <NodeSelectionAccordion
                                    title="Seleccionar nodo falseStep"
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
                                    Conexión errorStep
                                </Label>
                                <NodeConnectionsAccordion
                                    title="Nodos conectados (errorStep)"
                                    nodesList={errorConnections}
                                    accentColor="text-amber-700 dark:text-amber-300"
                                />
                                <NodeSelectionAccordion
                                    title="Seleccionar nodo errorStep"
                                    availableNodes={availableNodes}
                                    hasConnection={hasConnection}
                                    toggleConnection={toggleConnection}
                                    handleId="onError"
                                    accentColor="text-amber-700 dark:text-amber-300"
                                />
                            </div>

                            {/* ⏱️ OnTimeOut y OnTimeOutError */}
                            {(type === 'GETDATA' || type === 'SIMPLETEXT') && (
                                <>
                                    <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                                        <Label className="text-sm font-medium text-sky-600 dark:text-sky-400">
                                            Conexión timeOutStep
                                        </Label>
                                        <NodeConnectionsAccordion
                                            title="Nodos conectados (timeOutStep)"
                                            nodesList={
                                                timeOutConnections.length
                                                    ? timeOutConnections
                                                    : falseConnections
                                            }
                                            accentColor="text-sky-700 dark:text-sky-300"
                                        />
                                        <NodeSelectionAccordion
                                            title="Seleccionar nodo timeOutStep"
                                            availableNodes={availableNodes}
                                            hasConnection={hasConnection}
                                            toggleConnection={toggleConnection}
                                            handleId="onTimeOut"
                                            accentColor="text-sky-700 dark:text-sky-300"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                                        <Label className="text-sm font-medium text-violet-600 dark:text-violet-400">
                                            Conexión timeOutErrorStep
                                        </Label>
                                        <NodeConnectionsAccordion
                                            title="Nodos conectados (timeOutErrorStep)"
                                            nodesList={
                                                timeOutErrorConnections.length
                                                    ? timeOutErrorConnections
                                                    : errorConnections
                                            }
                                            accentColor="text-violet-700 dark:text-violet-300"
                                        />
                                        <NodeSelectionAccordion
                                            title="Seleccionar nodo timeOutErrorStep"
                                            availableNodes={availableNodes}
                                            hasConnection={hasConnection}
                                            toggleConnection={toggleConnection}
                                            handleId="onTimeOutError"
                                            accentColor="text-violet-700 dark:text-violet-300"
                                        />
                                    </div>
                                </>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>

            {/* 🧾 Descripción */}
            <div className="flex flex-col gap-1 border-t pt-3 dark:border-gray-800">
                <Label
                    htmlFor={`description-${id}`}
                    className="text-muted-foreground text-xs"
                >
                    Descripción
                </Label>
                <Input
                    id={`description-${id}`}
                    placeholder="Breve descripción del paso..."
                    value={data.description || ''}
                    onChange={(e) =>
                        updateNodeData(id, { description: e.target.value })
                    }
                    className="text-sm"
                />
            </div>

            {/* 🧱 Formularios dinámicos o advertencia */}
            {(() => {
                const isCompatible =
                    (type === 'QUICK_REPLY' &&
                        channel === FlowChannelEnum.WHATSAPP) ||
                    (type === 'LIST' && channel === FlowChannelEnum.WHATSAPP) ||
                    (type === 'GETDATA' &&
                        channel === FlowChannelEnum.CHATWEB) ||
                    (type === 'SIMPLETEXT' &&
                        channel === FlowChannelEnum.CHATWEB)

                if (!isCompatible) {
                    return (
                        <div className="mt-4 rounded-lg border border-amber-400 bg-amber-50 p-3 text-sm text-amber-700 dark:border-amber-600 dark:bg-amber-900/20 dark:text-amber-300">
                            ⚠️ Este tipo de interacción (<strong>{type}</strong>
                            ) no pertenece al canal actual{' '}
                            <strong>
                                {channel?.toUpperCase?.() || 'SIN CANAL'}
                            </strong>
                            {/* .
                            <br />
                            Por favor selecciona un canal compatible o cámbialo:
                            <div className="mt-2">
                                <Button
                                    size="sm"
                                    className="bg-purple-600 text-white hover:bg-purple-700"
                                    onClick={() => setChannel(undefined)}
                                >
                                    Cambiar canal
                                </Button>
                            </div> */}
                        </div>
                    )
                }

                if (
                    type === 'QUICK_REPLY' &&
                    channel === FlowChannelEnum.WHATSAPP
                )
                    return <FormGetDataCompleteQR id={id} />
                if (type === 'LIST' && channel === FlowChannelEnum.WHATSAPP)
                    return <FormGetDataCompleteList id={id} />
                if (type === 'GETDATA' && channel === FlowChannelEnum.CHATWEB)
                    return <FormGetDataCompleteGetData id={id} />
                if (
                    type === 'SIMPLETEXT' &&
                    channel === FlowChannelEnum.CHATWEB
                )
                    return <FormGetDataCompleteSimpleText id={id} />
                return null
            })()}
        </div>
    )
}
