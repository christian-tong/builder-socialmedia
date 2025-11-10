// src/components/forms/FormSaveRecordNode.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Code } from 'lucide-react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    SaveRecordObject,
    useSaveRecordStore,
} from '@/store/useSaveRecordStore'

interface KeyValue {
    id: string
    key: string
    value: string
}

/**
 * 🧾 FormSaveRecordNode (v1.8 – Descripción después de onTrue)
 * ------------------------------------------------------------
 * ✅ Campo "Descripción" debajo del bloque onTrue
 * ✅ Mantiene toda la lógica funcional y visual previa
 * ✅ Estilo unificado ámbar (institucional)
 */
export default function FormSaveRecordNode({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, safeUpdateAuth } =
        useSaveRecordStore()
    const {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        toggleConnection,
    } = useNodeConnections(id)

    /** Estado local */
    const [localData, setLocalData] = useState<Partial<SaveRecordObject>>({})
    const [pairs, setPairs] = useState<KeyValue[]>([])
    const [authPairs, setAuthPairs] = useState<KeyValue[]>([])
    const [jsonMode, setJsonMode] = useState(false)
    const [authJsonMode, setAuthJsonMode] = useState(false)

    // 🧩 Inicialización
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)

        try {
            const parsed = JSON.parse(current.body || '{}')
            if (typeof parsed === 'object')
                setPairs(
                    Object.entries(parsed).map(([k, v]) => ({
                        id: crypto.randomUUID(),
                        key: k,
                        value:
                            typeof v === 'object'
                                ? '[object Object]'
                                : String(v),
                    }))
                )
        } catch {
            setPairs([])
        }

        try {
            const parsedAuth = JSON.parse(current.auth?.body || '{}')
            if (typeof parsedAuth === 'object')
                setAuthPairs(
                    Object.entries(parsedAuth).map(([k, v]) => ({
                        id: crypto.randomUUID(),
                        key: k,
                        value: String(v),
                    }))
                )
        } catch {
            setAuthPairs([])
        }
    }, [id])

    // 🔧 Reconstruye el body JSON
    const reconstructBody = (pairs: KeyValue[], originalBody?: string) => {
        try {
            const base = JSON.parse(originalBody || '{}')
            const result: Record<string, any> = { ...base }

            pairs.forEach((p) => {
                if (p.key in result && typeof result[p.key] === 'object') return
                result[p.key] = p.value
            })

            return JSON.stringify(result, null, 2)
        } catch {
            return JSON.stringify(
                Object.fromEntries(pairs.map((p) => [p.key, p.value])),
                null,
                2
            )
        }
    }

    // 💾 Guardado global
    useEffect(() => {
        registerSaveCallback(id, () => {
            const current = getNodeData(id)

            const finalBody = jsonMode
                ? localData.body || '{}'
                : reconstructBody(pairs, current.body)

            const finalAuthBody = authJsonMode
                ? localData.auth?.body || '{}'
                : JSON.stringify(
                      Object.fromEntries(
                          authPairs.map((p) => [p.key, p.value])
                      ),
                      null,
                      2
                  )

            const merged: SaveRecordObject = {
                ...current,
                ...localData,
                body: finalBody,
                auth: {
                    ...(current.auth || {
                        headers: {},
                        vartoken: '',
                        url: '',
                        body: '',
                    }),
                    ...(localData.auth || {}),
                    body: finalAuthBody,
                },
            }

            setNodeData(id, merged)
            updateNodeData(id, {
                ...data,
                id,
                action: 'saverecord',
                object: merged,
            })
        })

        return () => unregisterSaveCallback(id)
    }, [
        id,
        jsonMode,
        authJsonMode,
        pairs,
        authPairs,
        localData,
        getNodeData,
        setNodeData,
        updateNodeData,
        registerSaveCallback,
        unregisterSaveCallback,
    ])

    /** ✏️ Handlers */
    const handleChange = (field: keyof SaveRecordObject, value: string) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    const handleAuthChange = (
        field: keyof SaveRecordObject['auth'],
        value: string
    ) => {
        safeUpdateAuth(id, { [field]: value })
        setLocalData((prev) => {
            const safeAuth: SaveRecordObject['auth'] = {
                headers: prev.auth?.headers ?? {},
                vartoken: prev.auth?.vartoken ?? '',
                body: prev.auth?.body ?? '',
                url: prev.auth?.url ?? '',
                [field]: value,
            }
            return { ...prev, auth: safeAuth }
        })
    }

    /** 🔄 Sincronización JSON/Visual */
    /** 🔄 Sincronización JSON/Visual */
    useEffect(() => {
        if (jsonMode) {
            const jsonStr = JSON.stringify(
                Object.fromEntries(pairs.map((p) => [p.key, p.value])),
                null,
                2
            )
            setLocalData((prev) => ({ ...prev, body: jsonStr }))
        }

        if (authJsonMode) {
            const jsonStr = JSON.stringify(
                Object.fromEntries(authPairs.map((p) => [p.key, p.value])),
                null,
                2
            )

            // 🔐 Actualiza el store global
            safeUpdateAuth(id, { body: jsonStr })

            // ✅ Reconstrucción tipada de auth garantizando headers
            setLocalData((prev) => ({
                ...prev,
                auth: {
                    headers: prev.auth?.headers ?? {},
                    vartoken: prev.auth?.vartoken ?? '',
                    url: prev.auth?.url ?? '',
                    body: jsonStr,
                },
            }))
        }
    }, [jsonMode, authJsonMode, pairs, authPairs, id, safeUpdateAuth])

    /** Helpers visuales */
    const addPair = () =>
        setPairs((p) => [...p, { id: crypto.randomUUID(), key: '', value: '' }])
    const removePair = (uid: string) =>
        setPairs((p) => p.filter((x) => x.id !== uid))
    const updatePair = (uid: string, field: keyof KeyValue, val: string) =>
        setPairs((p) =>
            p.map((x) => (x.id === uid ? { ...x, [field]: val } : x))
        )

    const addAuthPair = () =>
        setAuthPairs((p) => [
            ...p,
            { id: crypto.randomUUID(), key: '', value: '' },
        ])
    const removeAuthPair = (uid: string) =>
        setAuthPairs((p) => p.filter((x) => x.id !== uid))
    const updateAuthPair = (uid: string, field: keyof KeyValue, val: string) =>
        setAuthPairs((p) =>
            p.map((x) => (x.id === uid ? { ...x, [field]: val } : x))
        )

    /** Render */
    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-amber-600">
                    🧾 Configuración SaveRecord
                </Label>
                <Badge
                    variant="outline"
                    className="border-amber-600 px-2 py-0.5 text-[10px] text-amber-600"
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

            {/* ⚡ Conexión onTrue */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                    Conexión trueStep
                </Label>
                <NodeConnectionsAccordion
                    title="Nodos conectados (trueStep)"
                    nodesList={availableNodes
                        .filter((n) => hasConnection(n.id, 'onTrue'))
                        .map((n) => n.id)}
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

            {/* 🧾 Descripción debajo de onTrue */}
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

            {/* 🔐 Autenticación */}
            <div className="space-y-3 border-t pt-3 dark:border-gray-800">
                <Label className="text-xs font-medium text-amber-600">
                    🔗 URL de autenticación
                </Label>
                <Input
                    value={localData.auth?.url || ''}
                    onChange={(e) => handleAuthChange('url', e.target.value)}
                    placeholder="https://api.example.com/login"
                    className="text-xs"
                />

                <div className="mt-1 flex items-center justify-between">
                    <Label className="text-xs font-medium text-amber-600">
                        🧩 Body de autenticación
                    </Label>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAuthJsonMode((p) => !p)}
                        className="flex items-center gap-1 border-amber-600 bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                    >
                        <Code className="h-3.5 w-3.5" />
                        {authJsonMode ? 'Modo Visual' : 'Modo JSON'}
                    </Button>
                </div>

                {!authJsonMode ? (
                    <div className="mt-1 flex flex-col gap-2">
                        <div className="flex justify-between text-[11px] font-semibold text-amber-400 uppercase">
                            <span>KEY</span>
                            <span>VALUE</span>
                        </div>
                        {authPairs.map((p) => (
                            <div
                                key={p.id}
                                className="flex items-center gap-2 border-b pb-1 dark:border-gray-800"
                            >
                                <Input
                                    value={p.key}
                                    onChange={(e) =>
                                        updateAuthPair(
                                            p.id,
                                            'key',
                                            e.target.value
                                        )
                                    }
                                    placeholder="clave"
                                    className="text-xs"
                                />
                                <Input
                                    value={p.value}
                                    onChange={(e) =>
                                        updateAuthPair(
                                            p.id,
                                            'value',
                                            e.target.value
                                        )
                                    }
                                    placeholder="valor"
                                    className="text-xs"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeAuthPair(p.id)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={addAuthPair}
                            className="mt-1 border-amber-600 bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Agregar
                            parámetro
                        </Button>
                    </div>
                ) : (
                    <Textarea
                        value={localData.auth?.body || ''}
                        onChange={(e) =>
                            handleAuthChange('body', e.target.value)
                        }
                        placeholder='{"username":"core@wimprove.com","password":"***"}'
                        className="font-mono text-xs"
                        rows={4}
                    />
                )}

                <Label className="mt-2 text-xs font-medium text-amber-600">
                    🔑 Variable token
                </Label>
                <Input
                    value={localData.auth?.vartoken || ''}
                    onChange={(e) =>
                        handleAuthChange('vartoken', e.target.value)
                    }
                    placeholder="token"
                    className="text-xs"
                />
            </div>

            {/* 🧠 Cuerpo principal */}
            <div className="mt-4 flex items-center justify-between border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium">Cuerpo principal</Label>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJsonMode((p) => !p)}
                    className="flex items-center gap-1 border-amber-600 bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                >
                    <Code className="h-3.5 w-3.5" />
                    {jsonMode ? 'Modo Visual' : 'Modo JSON'}
                </Button>
            </div>

            {!jsonMode ? (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] font-semibold text-amber-400 uppercase">
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
                        className="mt-1 border-amber-600 bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar parámetro
                    </Button>
                </div>
            ) : (
                <Textarea
                    value={localData.body || ''}
                    onChange={(e) => handleChange('body', e.target.value)}
                    placeholder='{"field_167":"${SECTOR}","data":{"gestionId":"${TX_GESTIONID}"}}'
                    className="font-mono text-xs"
                    rows={8}
                />
            )}
        </div>
    )
}
