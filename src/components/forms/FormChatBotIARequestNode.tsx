// src\components\forms\FormChatBotIARequestNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { Settings2, Plus, Trash2, Code } from 'lucide-react'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    useChatBotIAStore,
    type ChatBotIARequest,
} from '@/store/useChatBotIAStore'

interface KeyValue {
    id: string
    key: string
    value: string
}

/**
 * 🤖 FormChatBotIARequestNode
 * ------------------------------------------------------
 * - Control completo del nodo IA
 * - Crea y elimina conexiones dinámicas (onTrue/onFalse)
 * - Modo visual / JSON para cuerpo de petición
 * - Sincronización diferida v1.1
 */
export default function FormChatBotIARequestNode({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData } = useChatBotIAStore()
    const { availableNodes, createConnection, removeConnection } =
        useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<ChatBotIARequest>>({})
    const [pairs, setPairs] = useState<KeyValue[]>([])
    const [jsonMode, setJsonMode] = useState(false)

    /** 🧩 Inicializa nodo desde el store */
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)

        try {
            const parsed = JSON.parse(current.body || '{}')
            if (parsed && typeof parsed === 'object') {
                setPairs(
                    Object.entries(parsed).map(([k, v]) => ({
                        id: crypto.randomUUID(),
                        key: k,
                        value: String(v),
                    }))
                )
            }
        } catch {
            setPairs([])
        }
    }, [id, initNode, getNodeData])

    /** 💾 Guardado diferido */
    useEffect(() => {
        registerSaveCallback(id, () => {
            let finalBody = localData.body || '{}'

            // 🧠 Si está en modo visual, serializa los pares clave/valor
            if (!jsonMode) {
                finalBody = JSON.stringify(
                    Object.fromEntries(pairs.map((p) => [p.key, p.value])),
                    null,
                    2
                )
            }

            const finalData = {
                ...getNodeData(id),
                ...localData,
                body: finalBody,
            }

            setNodeData(id, finalData)
            updateNodeData(id, {
                ...data,
                action: 'chatbotiarequest',
                id,
                object: finalData,
            })
        })

        return () => unregisterSaveCallback(id)
    }, [
        id,
        localData,
        pairs,
        jsonMode,
        registerSaveCallback,
        unregisterSaveCallback,
        getNodeData,
        setNodeData,
        updateNodeData,
        data,
    ])

    /** ✏️ Manejadores de campos */
    const handleChange = (field: keyof ChatBotIARequest, value: string) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    const addPair = () =>
        setPairs((prev) => [
            ...prev,
            { id: crypto.randomUUID(), key: '', value: '' },
        ])

    const removePair = (uid: string) =>
        setPairs((prev) => prev.filter((p) => p.id !== uid))

    const updatePair = (uid: string, field: keyof KeyValue, val: string) =>
        setPairs((prev) =>
            prev.map((p) => (p.id === uid ? { ...p, [field]: val } : p))
        )

    /** 🔄 Sincroniza body cuando se cambia a modo JSON */
    useEffect(() => {
        if (jsonMode) {
            const jsonStr = JSON.stringify(
                Object.fromEntries(pairs.map((p) => [p.key, p.value])),
                null,
                2
            )
            setLocalData((prev) => ({ ...prev, body: jsonStr }))
        }
    }, [jsonMode, pairs])

    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-indigo-600">
                    🤖 Configuración ChatBot IA
                </Label>
                <Badge
                    variant="outline"
                    className="border-indigo-600 px-2 py-0.5 text-[10px] text-indigo-600"
                >
                    {id}
                </Badge>
            </div>

            {/* ⚙️ Control de flujo */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="flowConfig">
                    <AccordionTrigger className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-sm font-medium dark:bg-gray-800">
                        <Settings2 className="h-4 w-4" />
                        Control de flujo (onTrue / onFalse)
                    </AccordionTrigger>

                    <AccordionContent className="mt-2 space-y-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900/40">
                        {(['onTrue', 'onFalse'] as const).map((key) => (
                            <NodeSelectAccordion
                                key={key}
                                title={
                                    key === 'onTrue'
                                        ? '🟢 onTrue (respuesta válida)'
                                        : '🔴 onFalse (respuesta inválida)'
                                }
                                availableNodes={availableNodes}
                                selectedId={data[key]}
                                handleId={key}
                                onSelect={(val: string) =>
                                    updateNodeData(id, { [key]: val })
                                }
                                createConnection={(targetId: string) =>
                                    createConnection(targetId, key)
                                }
                                removeConnection={(targetId: string) =>
                                    removeConnection(targetId, key)
                                }
                                accentColor="text-indigo-600"
                            />
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* 🧾 Campos principales */}
            <div className="flex flex-col gap-3">
                <Label className="text-xs">Variable destino</Label>
                <Input
                    value={localData.variable || ''}
                    onChange={(e) => handleChange('variable', e.target.value)}
                    placeholder="Ejemplo: ANSWER"
                    className="text-xs"
                />

                <Label className="mt-2 text-xs">URL de destino</Label>
                <Input
                    value={localData.url || ''}
                    onChange={(e) => handleChange('url', e.target.value)}
                    placeholder="https://..."
                    className="text-xs"
                />
            </div>

            {/* 🧩 Cuerpo JSON / Visual */}
            <div className="mt-3 flex items-center justify-between">
                <Label className="text-sm font-medium">
                    Cuerpo de la petición
                </Label>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJsonMode((prev) => !prev)}
                    className="flex items-center gap-1 border-indigo-600 bg-indigo-500 text-white hover:bg-indigo-600 hover:text-white"
                >
                    <Code className="h-3.5 w-3.5" />
                    {jsonMode ? 'Modo Visual' : 'Modo JSON'}
                </Button>
            </div>

            {!jsonMode ? (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] font-semibold text-indigo-400 uppercase">
                        <span>KEY</span>
                        <span>VALUE</span>
                    </div>

                    {pairs.map((p) => (
                        <div
                            key={p.id}
                            className="flex items-center gap-2 border-b pb-1 dark:border-gray-800"
                        >
                            <Input
                                value={p.key}
                                onChange={(e) =>
                                    updatePair(p.id, 'key', e.target.value)
                                }
                                placeholder="clave"
                                className="text-xs"
                            />
                            <Input
                                value={p.value}
                                onChange={(e) =>
                                    updatePair(p.id, 'value', e.target.value)
                                }
                                placeholder="valor"
                                className="text-xs"
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removePair(p.id)}
                                className="text-red-500 hover:text-red-600"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    ))}

                    <Button
                        size="sm"
                        variant="outline"
                        onClick={addPair}
                        className="mt-1 border-indigo-600 bg-indigo-500 text-white hover:bg-indigo-600 hover:text-white"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar parámetro
                    </Button>

                    {pairs.length === 0 && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            No hay parámetros definidos.
                        </p>
                    )}
                </div>
            ) : (
                <Textarea
                    value={localData.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                    placeholder='{"question":"${LASTVAR}","userId":"${DOCUMENTO}"}'
                    className="font-mono text-xs"
                    rows={8}
                />
            )}
        </div>
    )
}
