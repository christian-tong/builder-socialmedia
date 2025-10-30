// src\components\forms\Menu\FormGetDataCompleteList.tsx

'use client'

import React, { useEffect, useCallback, useMemo } from 'react'
import {
    Label,
    Input,
    Button,
    Textarea,
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useGetDataCompleteListStore } from '@/store/GetDataComplete/useGetDataCompleteListStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { OptionFlowManager } from '@/components/shared/OptionFlowManager'
import type { ListInteractive, ListOption } from '@/types/getDataComplete'
import { Switch } from '@/components/ui/switch'

/**
 * 🔵 FormGetDataCompleteList (v3.7 — Configuración base + saveHidden + opciones)
 * ------------------------------------------------------------
 * - Añade interruptor para `saveHidden`
 * - Mantiene la edición de campos base, items y opciones
 */
export function FormGetDataCompleteList({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const {
        addListItem,
        removeOption,
        updateField,
        updateSetVariables,
        toggleSaveHidden,
    } = useGetDataCompleteListStore()
    const { availableNodes, createConnectionIfMissing } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    if (nodeData.interactive?.type !== 'list') return null
    const list = nodeData.interactive as ListInteractive

    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

    /** 🧱 Inicialización mínima */
    useEffect(() => {
        if (!list.items?.length) {
            const updated: ListInteractive = {
                ...list,
                type: 'list',
                body: list.body || '',
                globalButtons:
                    list.globalButtons && list.globalButtons.length > 0
                        ? list.globalButtons
                        : [{ type: 'text', title: 'Elegir' }],
                items: [
                    {
                        title: 'Elija una opción',
                        options: [
                            { postbackText: '1', type: 'text', title: '' },
                        ],
                    },
                ],
            }
            setNodeData(id, { interactive: updated })
        }
    }, [])

    /** 🔄 Actualización inmutable */
    const updateInteractive = useCallback(
        (updater: (draft: ListInteractive) => void) => {
            const copy: ListInteractive = {
                ...list,
                items: list.items.map((i) => ({
                    title: i.title,
                    options: i.options.map((o) => ({ ...o })),
                })),
                globalButtons: list.globalButtons
                    ? list.globalButtons.map((b) => ({ ...b }))
                    : [],
            }
            updater(copy)
            setNodeData(id, { interactive: copy })
        },
        [list, setNodeData, id]
    )

    /* -------------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE DEL NODO                                                   */
    /* -------------------------------------------------------------------------- */
    const baseFields = [
        { key: 'condition', label: '🧩 Condition', placeholder: '[0-5]' },
        {
            key: 'groodText',
            label: '💬 GroodText',
            placeholder: 'Texto positivo...',
        },
        { key: 'setvar', label: '🏷️ SetVar', placeholder: 'TERCER_NIVEL' },
        { key: 'variable', label: '🔡 Variable', placeholder: 'TerceraOpcion' },
        { key: 'alias', label: '🪪 Alias', placeholder: 'Alias descriptivo' },
        { key: 'iterations', label: '🔁 Iterations', placeholder: '1' },
        { key: 'timeOut', label: '⏱️ Timeout (ms)', placeholder: '60000' },
    ] as const

    const handleFieldChange = (field: string, val: string) => {
        updateField(id, field as any, val)
        triggerAfterSave(id)
    }

    /* -------------------------------------------------------------------------- */
    /* 💾 SAVE HIDDEN SWITCH                                                     */
    /* -------------------------------------------------------------------------- */
    const handleToggleSaveHidden = (checked: boolean) => {
        toggleSaveHidden(id, checked)
        triggerAfterSave(id)
    }

    /* -------------------------------------------------------------------------- */
    /* 🧩 BODY                                                                    */
    /* -------------------------------------------------------------------------- */
    const handleBodyChange = (val: string) =>
        updateInteractive((d) => (d.body = val))

    /* -------------------------------------------------------------------------- */
    /* 🧱 RENDER                                                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="mt-6 space-y-6">
            {/* ⚙️ CONFIGURACIÓN BASE DEL NODO */}
            <section className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ⚙️ Configuración base del nodo
                </Label>

                {/* 🔘 SWITCH SAVE HIDDEN */}
                <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                    <Switch
                        checked={!!nodeData.saveHidden}
                        onCheckedChange={handleToggleSaveHidden}
                    />
                    <Label className="text-sm text-gray-700 dark:text-gray-300">
                        🔒 Guardar oculto (saveHidden)
                    </Label>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {baseFields.map((f) => (
                        <div key={f.key}>
                            <Label className="text-xs text-gray-500">
                                {f.label}
                            </Label>
                            <Input
                                value={decodeURIComponent(
                                    (nodeData[f.key] as string) || ''
                                )}
                                onChange={(e) =>
                                    handleFieldChange(
                                        f.key,
                                        encodeURIComponent(e.target.value)
                                    )
                                }
                                placeholder={f.placeholder}
                                className="text-xs"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* 💬 BODY */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Mensaje principal (body)
                </Label>
                <Textarea
                    value={decodeURIComponent(list.body || '')}
                    onChange={(e) =>
                        handleBodyChange(encodeURIComponent(e.target.value))
                    }
                    placeholder="Texto del mensaje principal..."
                    rows={3}
                    className="mt-1 font-mono text-xs"
                />
            </section>

            {/* 🔘 BOTONES GLOBALES */}
            <section>
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        🔘 Botones globales
                    </Label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            updateInteractive((d) => {
                                d.globalButtons = d.globalButtons || []
                                d.globalButtons.push({
                                    type: 'text',
                                    title: '',
                                })
                            })
                        }
                        className="border-sky-600 text-sky-600 hover:bg-sky-50"
                    >
                        <Plus className="mr-1 h-4 w-4" /> Añadir
                    </Button>
                </div>

                <div className="mt-2 space-y-2">
                    {list.globalButtons?.map((b, i) => (
                        <div
                            key={i}
                            className="flex items-center gap-2 rounded-md border border-gray-200 p-2 dark:border-gray-700"
                        >
                            <Input
                                value={decodeURIComponent(b.title || '')}
                                onChange={(e) =>
                                    updateInteractive((d) => {
                                        if (d.globalButtons?.[i])
                                            d.globalButtons[i].title =
                                                encodeURIComponent(
                                                    e.target.value
                                                )
                                    })
                                }
                                placeholder="Título del botón"
                                className="text-sm"
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                    updateInteractive((d) =>
                                        d.globalButtons?.splice(i, 1)
                                    )
                                }
                                className="text-red-500 hover:text-red-700"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            </section>

            {/* 🧩 ITEMS */}
            <section className="space-y-5">
                {list.items.map((item, itemIdx) => {
                    const usedDigits = useMemo(
                        () => new Set(item.options.map((o) => o.postbackText)),
                        [item.options]
                    )

                    return (
                        <div
                            key={itemIdx}
                            className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                        >
                            <Label className="text-xs text-gray-600">
                                🏷️ Título del grupo
                            </Label>
                            <Input
                                value={decodeURIComponent(item.title || '')}
                                onChange={(e) =>
                                    updateInteractive((d) => {
                                        d.items[itemIdx].title =
                                            encodeURIComponent(e.target.value)
                                    })
                                }
                                placeholder="Ej: Elija una opción"
                                className="text-sm font-semibold"
                            />

                            <div className="mt-3 flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        updateInteractive((d) => {
                                            const currentItem = d.items[itemIdx]
                                            const used = new Set(
                                                currentItem.options.map(
                                                    (o) => o.postbackText
                                                )
                                            )
                                            const next = DIGITS.find(
                                                (d) => !used.has(d)
                                            )
                                            if (!next) return
                                            currentItem.options.push({
                                                postbackText: next,
                                                type: 'text',
                                                title: '',
                                                description: '',
                                            })
                                        })
                                        triggerAfterSave(id)
                                    }}
                                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Añadir
                                    opción
                                </Button>
                            </div>

                            {/* Opciones */}
                            <div className="mt-4 space-y-3">
                                {item.options.map((opt, optIdx) => (
                                    <div
                                        key={optIdx}
                                        className="rounded-md border border-gray-200 p-2 dark:border-gray-700"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-gray-600">
                                                Opción {optIdx + 1}
                                            </Label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    removeOption(
                                                        id,
                                                        itemIdx,
                                                        optIdx
                                                    )
                                                    triggerAfterSave(id)
                                                }}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>

                                        {/* Campos */}
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-xs text-gray-500">
                                                    postbackText
                                                </Label>
                                                <Select
                                                    value={opt.postbackText}
                                                    onValueChange={(digit) => {
                                                        updateInteractive(
                                                            (d) => {
                                                                d.items[
                                                                    itemIdx
                                                                ].options[
                                                                    optIdx
                                                                ].postbackText =
                                                                    digit
                                                            }
                                                        )
                                                        triggerAfterSave(id)
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 border-emerald-500 text-xs">
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DIGITS.map((d) => (
                                                            <SelectItem
                                                                key={d}
                                                                value={d}
                                                                disabled={
                                                                    usedDigits.has(
                                                                        d
                                                                    ) &&
                                                                    opt.postbackText !==
                                                                        d
                                                                }
                                                            >
                                                                {d}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div>
                                                <Label className="text-xs text-gray-500">
                                                    title
                                                </Label>
                                                <Input
                                                    value={decodeURIComponent(
                                                        opt.title || ''
                                                    )}
                                                    onChange={(e) =>
                                                        updateInteractive(
                                                            (d) => {
                                                                d.items[
                                                                    itemIdx
                                                                ].options[
                                                                    optIdx
                                                                ].title =
                                                                    encodeURIComponent(
                                                                        e.target
                                                                            .value
                                                                    )
                                                            }
                                                        )
                                                    }
                                                    placeholder="Ej: Instalación"
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>

                                        <div className="col-span-2 mt-1">
                                            <Label className="text-xs text-gray-500">
                                                description
                                            </Label>
                                            <Input
                                                value={decodeURIComponent(
                                                    opt.description || ''
                                                )}
                                                onChange={(e) =>
                                                    updateInteractive((d) => {
                                                        d.items[
                                                            itemIdx
                                                        ].options[
                                                            optIdx
                                                        ].description =
                                                            encodeURIComponent(
                                                                e.target.value
                                                            )
                                                    })
                                                }
                                                placeholder="Ej: Sobre la instalación del baño portátil"
                                                className="text-xs"
                                            />
                                        </div>

                                        {/* 🧭 Conexión individual */}
                                        <div className="mt-3">
                                            <OptionFlowManager
                                                id={id}
                                                optionKey={opt.postbackText}
                                                selectedId={
                                                    (opt as any).nextNodeId
                                                }
                                                onSelect={(targetId) =>
                                                    updateInteractive((d) => {
                                                        ;(
                                                            d.items[itemIdx]
                                                                .options[
                                                                optIdx
                                                            ] as any
                                                        ).nextNodeId = targetId
                                                        if (targetId)
                                                            createConnectionIfMissing(
                                                                targetId,
                                                                opt.postbackText
                                                            )
                                                    })
                                                }
                                                availableNodes={availableNodes}
                                                accentColor="text-sky-600"
                                                deferred
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </section>
        </div>
    )
}
