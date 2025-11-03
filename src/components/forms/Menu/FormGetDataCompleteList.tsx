// src\components\forms\Menu\FormGetDataCompleteList.tsx

'use client'

import React, { useEffect, useCallback, useMemo, useState } from 'react'
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
import type { ListInteractive } from '@/types/getDataComplete'
import { Switch } from '@/components/ui/switch'
import { DynamicNodeConnectionsAccordion } from '@/components/shared/DynamicNodeConnectionsAccordion'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'

/**
 * 🔵 FormGetDataCompleteList (v4.1 — Sync Conditions + AutoEdgeReflect)
 * -----------------------------------------------------------------------
 * ✅ Sincroniza condiciones importadas (object.conditions) con opciones dinámicas
 * ✅ Actualiza automáticamente nextNodeId ↔ conditions en tiempo real
 * ✅ Compatible con DynamicNodeConnectionsAccordion v1.3
 * ✅ Mantiene el patrón de sincronización diferida (triggerAfterSave)
 */
export function FormGetDataCompleteList({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { updateField, toggleSaveHidden } = useGetDataCompleteListStore()
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
                conditions: { ...(list as any).conditions },
            }
            updater(copy)
            setNodeData(id, { interactive: copy })
        },
        [list, setNodeData, id]
    )

    /* 🧩 Sincroniza condiciones importadas con opciones (v4.3 — TypeSafe Sync)
     * ------------------------------------------------------------------------
     * ✅ nodeData ya es un GetDataCompleteObject, no un nodo completo
     * ✅ Compatible con ListOption.nextNodeId?: string
     * ✅ Convierte valores nullish a undefined (TS safe)
     * ✅ Se ejecuta una sola vez tras el montaje
     */
    useEffect(() => {
        // Extrae las condiciones existentes (del objeto o del bloque interactivo)
        const conditions: Record<string, string> =
            nodeData?.conditions ||
            (list?.conditions as Record<string, string>) ||
            {}

        const listData = nodeData.interactive as ListInteractive

        // Evita ejecución innecesaria si no hay items o condiciones
        if (!listData?.items?.length || !Object.keys(conditions).length) return

        updateInteractive((draft) => {
            const firstGroup = draft.items[0]
            if (!firstGroup?.options?.length) return

            // Actualiza nextNodeId para cada opción de forma segura
            firstGroup.options = firstGroup.options.map((opt) => ({
                ...opt,
                nextNodeId:
                    conditions?.[opt.postbackText] ||
                    opt.nextNodeId ||
                    undefined, // ✅ evita null → mantiene compatibilidad con TS
            }))
        })
    }, [])

    /* -------------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE                                                            */
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

    const handleToggleSaveHidden = (checked: boolean) => {
        toggleSaveHidden(id, checked)
        triggerAfterSave(id)
    }

    const handleBodyChange = (val: string) =>
        updateInteractive((d) => (d.body = val))

    /* -------------------------------------------------------------------------- */
    /* 🧱 RENDER                                                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="mt-6 space-y-6">
            {/* ⚙️ CONFIG BASE */}
            <section className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ⚙️ Configuración base del nodo
                </Label>

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

            {/* 🧩 LIST ITEMS */}
            <section className="space-y-6">
                {list.items.map((item, itemIdx) => {
                    const [localOptions, setLocalOptions] = useState(
                        item.options.map((o) => ({ ...o }))
                    )

                    const usedDigits = useMemo(
                        () => new Set(localOptions.map((o) => o.postbackText)),
                        [localOptions]
                    )

                    const handleSaveOptions = useCallback(() => {
                        updateInteractive((d) => {
                            d.items[itemIdx].options = localOptions.map(
                                (opt) => ({ ...opt })
                            )
                        })
                        triggerAfterSave(id)
                    }, [
                        localOptions,
                        itemIdx,
                        updateInteractive,
                        triggerAfterSave,
                        id,
                    ])

                    return (
                        <div
                            key={itemIdx}
                            className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-900/40"
                        >
                            <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                                🏷️ Grupo {itemIdx + 1}:{' '}
                                {decodeURIComponent(item.title || '')}
                            </Label>

                            <Accordion type="multiple" className="mt-2">
                                {/* ✏️ Edición de opciones */}
                                <AccordionItem value="options-edit">
                                    <AccordionTrigger className="rounded-md bg-emerald-100/70 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
                                        ✏️ Editar opciones (
                                        {localOptions.length})
                                    </AccordionTrigger>
                                    <AccordionContent className="mt-2 space-y-3">
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    const used = new Set(
                                                        localOptions.map(
                                                            (o) =>
                                                                o.postbackText
                                                        )
                                                    )
                                                    const next = DIGITS.find(
                                                        (d) => !used.has(d)
                                                    )
                                                    if (!next) return
                                                    setLocalOptions((prev) => [
                                                        ...prev,
                                                        {
                                                            postbackText: next,
                                                            type: 'text',
                                                            title: '',
                                                            description: '',
                                                        },
                                                    ])
                                                }}
                                                className="border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-500 hover:text-white"
                                            >
                                                <Plus className="mr-1 h-4 w-4" />
                                                Añadir opción
                                            </Button>
                                        </div>

                                        {localOptions.map((opt, optIdx) => (
                                            <div
                                                key={optIdx}
                                                className="rounded-md border border-emerald-200 bg-white/80 p-2 text-xs shadow-sm dark:border-emerald-700 dark:bg-gray-950"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-[10px] text-gray-500">
                                                        Opción {optIdx + 1}
                                                    </Label>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() =>
                                                            setLocalOptions(
                                                                (prev) =>
                                                                    prev.filter(
                                                                        (
                                                                            _,
                                                                            i
                                                                        ) =>
                                                                            i !==
                                                                            optIdx
                                                                    )
                                                            )
                                                        }
                                                        className="h-5 w-5 text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                                <div className="mt-2 grid grid-cols-2 gap-2">
                                                    <div>
                                                        <Label className="text-[10px] text-gray-500">
                                                            postbackText
                                                        </Label>
                                                        <Select
                                                            value={
                                                                opt.postbackText
                                                            }
                                                            onValueChange={(
                                                                digit
                                                            ) =>
                                                                setLocalOptions(
                                                                    (prev) =>
                                                                        prev.map(
                                                                            (
                                                                                o,
                                                                                i
                                                                            ) =>
                                                                                i ===
                                                                                optIdx
                                                                                    ? {
                                                                                          ...o,
                                                                                          postbackText:
                                                                                              digit,
                                                                                      }
                                                                                    : o
                                                                        )
                                                                )
                                                            }
                                                        >
                                                            <SelectTrigger className="h-8 border-emerald-400 text-xs">
                                                                <SelectValue placeholder="Seleccionar..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {DIGITS.map(
                                                                    (d) => (
                                                                        <SelectItem
                                                                            key={
                                                                                d
                                                                            }
                                                                            value={
                                                                                d
                                                                            }
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
                                                                    )
                                                                )}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div>
                                                        <Label className="text-[10px] text-gray-500">
                                                            title
                                                        </Label>
                                                        <Input
                                                            value={decodeURIComponent(
                                                                opt.title || ''
                                                            )}
                                                            onChange={(e) =>
                                                                setLocalOptions(
                                                                    (prev) =>
                                                                        prev.map(
                                                                            (
                                                                                o,
                                                                                i
                                                                            ) =>
                                                                                i ===
                                                                                optIdx
                                                                                    ? {
                                                                                          ...o,
                                                                                          title: encodeURIComponent(
                                                                                              e
                                                                                                  .target
                                                                                                  .value
                                                                                          ),
                                                                                      }
                                                                                    : o
                                                                        )
                                                                )
                                                            }
                                                            placeholder="Ej: Instalación"
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-1">
                                                    <Label className="text-[10px] text-gray-500">
                                                        description
                                                    </Label>
                                                    <Input
                                                        value={decodeURIComponent(
                                                            opt.description ||
                                                                ''
                                                        )}
                                                        onChange={(e) =>
                                                            setLocalOptions(
                                                                (prev) =>
                                                                    prev.map(
                                                                        (
                                                                            o,
                                                                            i
                                                                        ) =>
                                                                            i ===
                                                                            optIdx
                                                                                ? {
                                                                                      ...o,
                                                                                      description:
                                                                                          encodeURIComponent(
                                                                                              e
                                                                                                  .target
                                                                                                  .value
                                                                                          ),
                                                                                  }
                                                                                : o
                                                                    )
                                                            )
                                                        }
                                                        placeholder="Descripción..."
                                                        className="text-xs"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        <div className="flex justify-end pt-2">
                                            <Button
                                                onClick={handleSaveOptions}
                                                className="bg-emerald-600 text-white hover:bg-emerald-700"
                                            >
                                                💾 Guardar opciones
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* 🔗 Conexiones */}
                                <AccordionItem value="connections">
                                    <AccordionTrigger className="rounded-md bg-purple-100/60 px-3 py-2 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                        🔗 Conexiones de opciones
                                    </AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <DynamicNodeConnectionsAccordion
                                            nodeId={id}
                                            variant="list"
                                            options={item.options.map(
                                                (opt) => ({
                                                    id: opt.postbackText,
                                                    label: decodeURIComponent(
                                                        opt.title ||
                                                            opt.postbackText
                                                    ),
                                                    nextNodeId: (opt as any)
                                                        .nextNodeId,
                                                })
                                            )}
                                            onUpdateOption={(
                                                optionId,
                                                key,
                                                value
                                            ) =>
                                                updateInteractive((d) => {
                                                    const option = d.items[
                                                        itemIdx
                                                    ].options.find(
                                                        (o) =>
                                                            o.postbackText ===
                                                            optionId
                                                    )
                                                    if (option)
                                                        (option as any)[key] =
                                                            value
                                                    if (!d.conditions)
                                                        d.conditions = {}
                                                    if (value)
                                                        d.conditions[optionId] =
                                                            value
                                                    else
                                                        delete d.conditions[
                                                            optionId
                                                        ]
                                                })
                                            }
                                        />
                                    </AccordionContent>
                                </AccordionItem>
                            </Accordion>
                        </div>
                    )
                })}
            </section>
        </div>
    )
}
