// src\components\forms\FormGenerateTokenNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import {
    Input,
    Label,
    Button,
    Textarea,
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from '@/components/ui'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    useGenerateTokenStore,
    type GenerateTokenObject,
} from '@/store/useGenerateTokenStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { Plus, Trash2, Code } from 'lucide-react'

interface KeyValue {
    id: string
    key: string
    value: string
}

/**
 * 🪄 FormGenerateTokenNode (v1.6 – Fix ancho + JSON)
 * -------------------------------------------------------
 * ✅ Ajuste de ancho automático con grid fluido
 * ✅ Corrige error TS de tipo body (string vs Record)
 * ✅ Modo visual / JSON compatible con SaveRecord
 * ✅ Mantiene diseño violeta coherente
 */
export default function FormGenerateTokenNode({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData } = useGenerateTokenStore()
    const {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        toggleConnection,
    } = useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<GenerateTokenObject>>({})
    const [pairs, setPairs] = useState<KeyValue[]>([])
    const [jsonMode, setJsonMode] = useState(false)

    /** 🧩 Inicialización */
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)
        const body = current.body || {}
        setPairs(
            Object.entries(body).map(([k, v]) => ({
                id: crypto.randomUUID(),
                key: k,
                value: String(v),
            }))
        )
    }, [id])

    /** 💾 Guardado diferido (con tipos correctos) */
    useEffect(() => {
        registerSaveCallback(id, () => {
            let parsedBody: Record<string, string> = {}

            if (jsonMode) {
                try {
                    const raw = localData.body
                    const bodyString =
                        typeof raw === 'string'
                            ? raw
                            : JSON.stringify(raw ?? {}, null, 2)

                    parsedBody = JSON.parse(bodyString)
                } catch {
                    parsedBody = {}
                }
            } else {
                parsedBody = Object.fromEntries(
                    pairs.map((p) => [p.key, p.value])
                )
            }

            const merged: GenerateTokenObject = {
                ...getNodeData(id),
                ...localData,
                body: parsedBody,
            }

            setNodeData(id, merged)
            updateNodeData(id, { ...data, object: merged })
        })

        return () => unregisterSaveCallback(id)
    }, [id, pairs, localData, jsonMode])

    /** ✏️ Helpers */
    const handleChange = (field: keyof GenerateTokenObject, value: any) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    const addPair = () =>
        setPairs((p) => [...p, { id: crypto.randomUUID(), key: '', value: '' }])
    const removePair = (uid: string) =>
        setPairs((p) => p.filter((x) => x.id !== uid))
    const updatePair = (uid: string, field: keyof KeyValue, val: string) =>
        setPairs((p) =>
            p.map((x) => (x.id === uid ? { ...x, [field]: val } : x))
        )

    return (
        <div className="flex w-full flex-col gap-6 overflow-x-auto">
            {/* 🔗 Conexiones */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-[#AA3E98]"
            />
            <NodeSelectionAccordion
                title="Conectar / desconectar"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                accentColor="text-[#AA3E98]"
            />

            {/* ⚙️ Configuración principal */}
            <div className="w-full space-y-3">
                <Label className="text-sm font-semibold text-[#AA3E98]">
                    🪄 Modo
                </Label>
                <Select
                    value={localData.mode || 'simpletext'}
                    onValueChange={(val) => handleChange('mode', val)}
                >
                    <SelectTrigger className="w-full border-[#AA3E98] text-xs focus:ring-[#AA3E98]">
                        <SelectValue placeholder="Seleccionar modo" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="simpletext">Simple Text</SelectItem>
                    </SelectContent>
                </Select>

                <Label className="text-sm font-semibold text-[#AA3E98]">
                    🧩 Texto
                </Label>
                <Input
                    value={localData.text || ''}
                    onChange={(e) => handleChange('text', e.target.value)}
                    placeholder="Clic aquí"
                    className="w-full border-[#AA3E98] text-xs focus-visible:ring-[#AA3E98]"
                />

                {/* BODY */}
                <div className="mt-3 flex items-center justify-between">
                    <Label className="text-sm font-semibold text-[#AA3E98]">
                        📦 Parámetros (body)
                    </Label>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setJsonMode((p) => !p)}
                        className="flex items-center gap-1 border-[#AA3E98] bg-[#AA3E98] text-white hover:bg-[#922F84]"
                    >
                        <Code className="h-3.5 w-3.5" />
                        {jsonMode ? 'Modo Visual' : 'Modo JSON'}
                    </Button>
                </div>

                {!jsonMode ? (
                    <div className="flex w-full flex-col gap-2 overflow-x-auto">
                        <div className="flex justify-between text-[11px] font-semibold text-[#AA3E98] uppercase">
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
                                    className="min-w-0 flex-1 border-[#AA3E98] text-xs"
                                />
                                <Input
                                    value={p.value}
                                    onChange={(e) =>
                                        updatePair(
                                            p.id,
                                            'value',
                                            e.target.value
                                        )
                                    }
                                    placeholder="valor"
                                    className="min-w-0 flex-1 border-[#AA3E98] text-xs"
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
                            className="mt-1 border-[#AA3E98] bg-[#AA3E98] text-white hover:bg-[#922F84]"
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Agregar
                            parámetro
                        </Button>
                    </div>
                ) : (
                    <Textarea
                        value={
                            typeof localData.body === 'string'
                                ? localData.body
                                : JSON.stringify(localData.body || {}, null, 2)
                        }
                        onChange={(e) => handleChange('body', e.target.value)}
                        placeholder='{"skillNumber":"10008","gestionId":"${TX_GESTIONID}"}'
                        className="w-full resize-y overflow-auto font-mono text-xs focus-visible:ring-[#AA3E98]"
                        rows={8}
                    />
                )}

                <Label className="mt-3 text-sm font-semibold text-[#AA3E98]">
                    📝 Script (HTML)
                </Label>
                <Textarea
                    value={localData.script || ''}
                    onChange={(e) => handleChange('script', e.target.value)}
                    placeholder="Hola ${NOMBRE_APELLIDOS}, ..."
                    className="w-full resize-y overflow-auto font-mono text-xs focus-visible:ring-[#AA3E98]"
                    rows={8}
                />
            </div>
        </div>
    )
}
