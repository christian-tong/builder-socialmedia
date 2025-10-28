// src\components\forms\FormSaveRecordNode.tsx

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
    SaveRecordObject,
    useSaveRecordStore,
} from '@/store/useSaveRecordStore'

interface KeyValue {
    id: string
    key: string
    value: string
}

/**
 * 🧾 FormSaveRecordNode (v1.3)
 * ------------------------------------------------------
 * - Modo visual / JSON tanto para `auth.body` como para `body`
 * - Usa safeUpdateAuth del store (sin errores de tipo)
 * - Control diferido (onTrue)
 */
export default function FormSaveRecordNode({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, safeUpdateAuth } =
        useSaveRecordStore()
    const { availableNodes } = useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<SaveRecordObject>>({})
    const [pairs, setPairs] = useState<KeyValue[]>([]) // cuerpo principal
    const [authPairs, setAuthPairs] = useState<KeyValue[]>([]) // cuerpo auth
    const [jsonMode, setJsonMode] = useState(false)
    const [authJsonMode, setAuthJsonMode] = useState(false)

    /** 🧩 Inicializa nodo */
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)

        // 🔹 Parse body principal
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

        // 🔹 Parse body de autenticación
        try {
            const parsedAuth = JSON.parse(current.auth?.body || '{}')
            if (parsedAuth && typeof parsedAuth === 'object') {
                setAuthPairs(
                    Object.entries(parsedAuth).map(([k, v]) => ({
                        id: crypto.randomUUID(),
                        key: k,
                        value: String(v),
                    }))
                )
            }
        } catch {
            setAuthPairs([])
        }
    }, [id, initNode, getNodeData])

    /** 💾 Guardado diferido */
    useEffect(() => {
        registerSaveCallback(id, () => {
            let finalBody = localData.body || '{}'
            let finalAuthBody = localData.auth?.body || '{}'

            // 🔹 Serializa visual → JSON
            if (!jsonMode) {
                finalBody = JSON.stringify(
                    Object.fromEntries(pairs.map((p) => [p.key, p.value])),
                    null,
                    2
                )
            }

            if (!authJsonMode) {
                finalAuthBody = JSON.stringify(
                    Object.fromEntries(authPairs.map((p) => [p.key, p.value])),
                    null,
                    2
                )
            }

            const finalData: SaveRecordObject = {
                ...getNodeData(id),
                ...localData,
                body: finalBody,
                auth: {
                    ...(localData.auth || {
                        headers: {},
                        vartoken: '',
                        url: '',
                        body: '',
                    }),
                    body: finalAuthBody,
                },
            }

            setNodeData(id, finalData)
            updateNodeData(id, {
                ...data,
                id,
                action: 'saverecord',
                object: finalData,
            })
        })

        return () => unregisterSaveCallback(id)
    }, [
        id,
        localData,
        pairs,
        authPairs,
        jsonMode,
        authJsonMode,
        data,
        registerSaveCallback,
        unregisterSaveCallback,
        getNodeData,
        setNodeData,
        updateNodeData,
    ])

    /** ✏️ Manejadores seguros */
    const handleAuthChange = (
        field: keyof SaveRecordObject['auth'],
        value: string
    ) => {
        safeUpdateAuth(id, { [field]: value })
        setLocalData((prev) => ({
            ...prev,
            auth: { ...(prev.auth || {}), [field]: value },
        }))
    }

    const handleChange = (field: keyof SaveRecordObject, value: string) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    // 🔸 Helpers para body principal
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

    // 🔸 Helpers para body de autenticación
    const addAuthPair = () =>
        setAuthPairs((prev) => [
            ...prev,
            { id: crypto.randomUUID(), key: '', value: '' },
        ])
    const removeAuthPair = (uid: string) =>
        setAuthPairs((prev) => prev.filter((p) => p.id !== uid))
    const updateAuthPair = (uid: string, field: keyof KeyValue, val: string) =>
        setAuthPairs((prev) =>
            prev.map((p) => (p.id === uid ? { ...p, [field]: val } : p))
        )

    /** 🔄 Sincroniza JSON <-> Visual usando safeUpdateAuth */
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
            safeUpdateAuth(id, { body: jsonStr })
            setLocalData((prev) => ({
                ...prev,
                auth: { ...(prev.auth || {}), body: jsonStr },
            }))
        }
    }, [jsonMode, authJsonMode, pairs, authPairs, id, safeUpdateAuth])

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

            {/* ⚙️ Control de flujo */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="flowConfig">
                    <AccordionTrigger className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-sm font-medium dark:bg-gray-800">
                        <Settings2 className="h-4 w-4" />
                        Control de flujo (onTrue)
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900/40">
                        <NodeSelectAccordion
                            title="🟢 onTrue (éxito)"
                            availableNodes={availableNodes}
                            selectedId={data.onTrue}
                            handleId="onTrue"
                            sourceId={id}
                            deferred={true}
                            onSelect={(val: string) =>
                                updateNodeData(id, { onTrue: val })
                            }
                            onUnselect={() =>
                                updateNodeData(id, { onTrue: '' })
                            }
                            accentColor="text-amber-600"
                        />
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* 🔐 Autenticación */}
            <div className="space-y-3">
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
                        {authPairs.length === 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                No hay parámetros definidos.
                            </p>
                        )}
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
            <div className="mt-4 flex items-center justify-between">
                <Label className="text-sm font-medium">Cuerpo principal</Label>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setJsonMode((prev) => !prev)}
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
                    placeholder='{"field_167":"${SECTOR}","field_169":"${NOMBRE_APELLIDOS}"}'
                    className="font-mono text-xs"
                    rows={8}
                />
            )}
        </div>
    )
}
