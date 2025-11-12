// src/components/forms/FormSaveRecordNode.tsx
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
 * 🧾 FormSaveRecordNode (v2.2 – auto-formateo JSON en body y auth)
 * -----------------------------------------------------------------
 * ✅ Autoformateo JSON pretty en cuerpo principal y body de autenticación
 * ✅ Campo "Descripción" debajo del bloque onTrue
 * ✅ Badge “objeto” para valores con JSON anidado
 * ✅ Editor modal para modificar objetos
 * ✅ Estilo unificado ámbar (institucional)
 */
export default function FormSaveRecordNode({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, safeUpdateAuth } =
        useSaveRecordStore()
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<SaveRecordObject>>({})
    const [pairs, setPairs] = useState<KeyValue[]>([])
    const [authPairs, setAuthPairs] = useState<KeyValue[]>([])
    const [jsonMode, setJsonMode] = useState(false)
    const [authJsonMode, setAuthJsonMode] = useState(false)
    const [editingObject, setEditingObject] = useState<KeyValue | null>(null)
    const [objectEditorValue, setObjectEditorValue] = useState('')

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
                                ? JSON.stringify(v, null, 2)
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
                        value:
                            typeof v === 'object'
                                ? JSON.stringify(v, null, 2)
                                : String(v),
                    }))
                )
        } catch {
            setAuthPairs([])
        }
    }, [id])

    // 🔧 Reconstruye el body JSON (para guardar)
    const reconstructBody = (pairs: KeyValue[], originalBody?: string) => {
        try {
            const base = JSON.parse(originalBody || '{}')
            const result: Record<string, any> = { ...base }

            pairs.forEach((p) => {
                const raw = p.value?.trim()
                const looksLikeJson =
                    (raw.startsWith('{') && raw.endsWith('}')) ||
                    (raw.startsWith('[') && raw.endsWith(']'))

                if (looksLikeJson) {
                    try {
                        result[p.key] = JSON.parse(raw)
                        return
                    } catch {
                        result[p.key] = raw
                        return
                    }
                }
                result[p.key] = raw
            })

            return JSON.stringify(result, null, 2)
        } catch {
            return JSON.stringify(
                Object.fromEntries(
                    pairs.map((p) => {
                        try {
                            return [p.key, JSON.parse(p.value)]
                        } catch {
                            return [p.key, p.value]
                        }
                    })
                ),
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

    const handleChange = (field: keyof SaveRecordObject, value: string) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    const handleAuthChange = (
        field: keyof SaveRecordObject['auth'],
        value: string
    ) => {
        safeUpdateAuth(id, { [field]: value })
        setLocalData((prev) => ({
            ...prev,
            auth: {
                headers: prev.auth?.headers ?? {},
                vartoken: prev.auth?.vartoken ?? '',
                body: prev.auth?.body ?? '',
                url: prev.auth?.url ?? '',
                [field]: value,
            },
        }))
    }

    // 🧩 Editor modal de objetos
    const openObjectEditor = (pair: KeyValue) => {
        setEditingObject(pair)
        try {
            const parsed = JSON.parse(pair.value)
            setObjectEditorValue(JSON.stringify(parsed, null, 2))
        } catch {
            setObjectEditorValue(pair.value)
        }
    }

    const saveObjectEditor = () => {
        if (!editingObject) return
        let formattedValue = objectEditorValue.trim()
        try {
            const parsed = JSON.parse(formattedValue)
            formattedValue = JSON.stringify(parsed, null, 2)
        } catch {}
        setPairs((prev) =>
            prev.map((x) =>
                x.id === editingObject.id ? { ...x, value: formattedValue } : x
            )
        )
        setEditingObject(null)
        setObjectEditorValue('')
    }

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

            {/* 🧾 Descripción */}
            <div className="flex flex-col gap-1 border-t pt-3 dark:border-gray-800">
                <Label className="text-muted-foreground text-xs">
                    Descripción
                </Label>
                <Input
                    value={data.description || ''}
                    onChange={(e) =>
                        updateNodeData(id, { description: e.target.value })
                    }
                    placeholder="Breve descripción del paso..."
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

                {authJsonMode ? (
                    (() => {
                        let formattedAuth = ''
                        try {
                            if (
                                typeof localData.auth?.body === 'object' &&
                                localData.auth?.body !== null
                            ) {
                                formattedAuth = JSON.stringify(
                                    localData.auth?.body,
                                    null,
                                    2
                                )
                            } else if (
                                typeof localData.auth?.body === 'string' &&
                                (localData.auth?.body.trim().startsWith('{') ||
                                    localData.auth?.body.trim().startsWith('['))
                            ) {
                                const parsed = JSON.parse(localData.auth?.body)
                                formattedAuth = JSON.stringify(parsed, null, 2)
                            } else {
                                formattedAuth = localData.auth?.body || ''
                            }
                        } catch {
                            formattedAuth = localData.auth?.body || ''
                        }

                        return (
                            <Textarea
                                value={formattedAuth}
                                onChange={(e) => {
                                    const raw = e.target.value
                                    try {
                                        const parsed = JSON.parse(raw)
                                        handleAuthChange(
                                            'body',
                                            JSON.stringify(parsed, null, 2)
                                        )
                                    } catch {
                                        handleAuthChange('body', raw)
                                    }
                                }}
                                placeholder='{"username":"core@wimprove.com","password":"***"}'
                                className="font-mono text-xs"
                                rows={6}
                                spellCheck={false}
                            />
                        )
                    })()
                ) : (
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
                                        setAuthPairs((prev) =>
                                            prev.map((x) =>
                                                x.id === p.id
                                                    ? {
                                                          ...x,
                                                          key: e.target.value,
                                                      }
                                                    : x
                                            )
                                        )
                                    }
                                    placeholder="clave"
                                    className="text-xs"
                                />
                                <Input
                                    value={p.value}
                                    onChange={(e) =>
                                        setAuthPairs((prev) =>
                                            prev.map((x) =>
                                                x.id === p.id
                                                    ? {
                                                          ...x,
                                                          value: e.target.value,
                                                      }
                                                    : x
                                            )
                                        )
                                    }
                                    placeholder="valor"
                                    className="text-xs"
                                />
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                        setAuthPairs((prev) =>
                                            prev.filter((x) => x.id !== p.id)
                                        )
                                    }
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        ))}
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                                setAuthPairs((p) => [
                                    ...p,
                                    {
                                        id: crypto.randomUUID(),
                                        key: '',
                                        value: '',
                                    },
                                ])
                            }
                            className="mt-1 border-amber-600 bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                        >
                            <Plus className="mr-1 h-3.5 w-3.5" /> Agregar
                            parámetro
                        </Button>
                    </div>
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

            {jsonMode ? (
                (() => {
                    let formattedValue = ''
                    try {
                        if (
                            typeof localData.body === 'object' &&
                            localData.body !== null
                        ) {
                            formattedValue = JSON.stringify(
                                localData.body,
                                null,
                                2
                            )
                        } else if (
                            typeof localData.body === 'string' &&
                            (localData.body.trim().startsWith('{') ||
                                localData.body.trim().startsWith('['))
                        ) {
                            const parsed = JSON.parse(localData.body)
                            formattedValue = JSON.stringify(parsed, null, 2)
                        } else {
                            formattedValue = localData.body || ''
                        }
                    } catch {
                        formattedValue = localData.body || ''
                    }

                    return (
                        <Textarea
                            value={formattedValue}
                            onChange={(e) => {
                                const raw = e.target.value
                                try {
                                    const parsed = JSON.parse(raw)
                                    handleChange(
                                        'body',
                                        JSON.stringify(parsed, null, 2)
                                    )
                                } catch {
                                    handleChange('body', raw)
                                }
                            }}
                            placeholder='{"field_167":"${SECTOR}","data":{"gestionId":"${TX_GESTIONID}"}}'
                            className="font-mono text-xs"
                            rows={12}
                            spellCheck={false}
                        />
                    )
                })()
            ) : (
                <div className="mt-2 flex flex-col gap-2">
                    <div className="flex justify-between text-[11px] font-semibold text-amber-400 uppercase">
                        <span>KEY</span>
                        <span>VALUE</span>
                    </div>
                    {pairs.map((p) => {
                        const isObject =
                            p.value.trim().startsWith('{') ||
                            p.value.trim().startsWith('[')
                        return (
                            <div
                                key={p.id}
                                className="flex items-center gap-2 border-b pb-1 dark:border-gray-800"
                            >
                                <Input
                                    value={p.key}
                                    onChange={(e) =>
                                        setPairs((prev) =>
                                            prev.map((x) =>
                                                x.id === p.id
                                                    ? {
                                                          ...x,
                                                          key: e.target.value,
                                                      }
                                                    : x
                                            )
                                        )
                                    }
                                    placeholder="clave"
                                    className="text-xs"
                                />
                                <div className="relative w-full">
                                    <Input
                                        value={isObject ? '[objeto]' : p.value}
                                        readOnly={isObject}
                                        onChange={(e) =>
                                            setPairs((prev) =>
                                                prev.map((x) =>
                                                    x.id === p.id
                                                        ? {
                                                              ...x,
                                                              value: e.target
                                                                  .value,
                                                          }
                                                        : x
                                                )
                                            )
                                        }
                                        className={`text-xs ${
                                            isObject
                                                ? 'pr-16 font-mono text-amber-700 dark:text-amber-300'
                                                : ''
                                        }`}
                                    />
                                    {isObject && (
                                        <Badge
                                            onClick={() => openObjectEditor(p)}
                                            className="absolute top-1/2 right-2 -translate-y-1/2 cursor-pointer bg-amber-500 text-white hover:bg-amber-600"
                                        >
                                            objeto
                                        </Badge>
                                    )}
                                </div>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() =>
                                        setPairs((prev) =>
                                            prev.filter((x) => x.id !== p.id)
                                        )
                                    }
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        )
                    })}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                            setPairs((p) => [
                                ...p,
                                { id: crypto.randomUUID(), key: '', value: '' },
                            ])
                        }
                        className="mt-1 border-amber-600 bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar parámetro
                    </Button>
                </div>
            )}

            {/* 🧩 Editor modal para objetos */}
            {editingObject && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-4 shadow-xl dark:bg-zinc-900">
                        <Label className="text-sm font-semibold text-amber-600">
                            Detalle: {editingObject.key}
                        </Label>
                        <Textarea
                            value={objectEditorValue}
                            disabled
                            rows={12}
                            spellCheck={false}
                            className="mt-2 font-mono text-xs"
                        />
                        <div className="mt-3 flex justify-end gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setEditingObject(null)}
                            >
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
