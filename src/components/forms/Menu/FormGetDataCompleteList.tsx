// src\components\forms\Menu\FormGetDataCompleteList.tsx

'use client'

import React, { useEffect, useCallback, useMemo, useState, useRef } from 'react'
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
    Switch,
} from '@/components/ui'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useGetDataCompleteListStore } from '@/store/GetDataComplete/useGetDataCompleteListStore'
import type { ListInteractive } from '@/types/getDataComplete'
import { DynamicNodeConnectionsAccordion } from '@/components/shared/DynamicNodeConnectionsAccordion'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'

/**
 * 💙 FormGetDataCompleteList (v4.8 — Azul + Campos Editables)
 * ------------------------------------------------------------
 * ✅ Validaciones WhatsApp List:
 *    - body.text: máx. 1024 caracteres
 *    - button.title: máx. 20 caracteres
 *    - item.title: máx. 24 caracteres
 *    - option.description: máx. 72 caracteres
 * ✅ Colores azules (coherentes con nodo List)
 * ✅ Editable: título del botón y título del grupo
 */
export function FormGetDataCompleteList({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { updateField, toggleSaveHidden } = useGetDataCompleteListStore()
    const nodeData = getNodeData(id)
    if (nodeData.interactive?.type !== 'list') return null

    const list = nodeData.interactive as ListInteractive
    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const
    const [accordionValue, setAccordionValue] = useState<string[]>([
        'options-edit',
    ])
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

    /** 🧱 Inicialización mínima */
    useEffect(() => {
        if (!list.items?.length) {
            const updated: ListInteractive = {
                ...list,
                type: 'list',
                body: list.body || '',
                globalButtons: list.globalButtons?.length
                    ? list.globalButtons
                    : [{ type: 'text', title: 'Elegir' }],
                items: [
                    {
                        title: 'Seleccione una opción',
                        options: [
                            {
                                postbackText: '1',
                                type: 'text',
                                title: '',
                                description: '',
                            },
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
                globalButtons: list.globalButtons?.map((b) => ({ ...b })) || [],
                conditions: { ...(list as any).conditions },
            }
            updater(copy)
            setNodeData(id, { interactive: copy })
        },
        [list, setNodeData, id]
    )

    /* -------------------------------------------------------------------------- */
    /* 💬 BODY VALIDATION (máx. 1024 caracteres)                                  */
    /* -------------------------------------------------------------------------- */
    const handleBodyChange = (value: string) => {
        if (value.length > 1024) {
            toast.warning('Máximo 1024 caracteres permitidos.')
            return
        }
        updateInteractive((d) => (d.body = value))
    }

    /* -------------------------------------------------------------------------- */
    /* 🧩 CAMPOS BASE + BUTTON TITLE                                              */
    /* -------------------------------------------------------------------------- */
    const handleButtonTitleChange = (val: string) => {
        if (val.length > 20) {
            toast.warning('Máx. 20 caracteres para el texto del botón.')
            return
        }
        updateInteractive((d) => {
            if (!d.globalButtons || !d.globalButtons.length)
                d.globalButtons = [{ type: 'text', title: val }]
            else d.globalButtons[0].title = val
        })
    }

    const baseFields = [
        { key: 'condition', label: '🧩 Condition', placeholder: '[0-5]' },
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

    /* -------------------------------------------------------------------------- */
    /* 🧩 RENDER PRINCIPAL                                                       */
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

            {/* 🔘 TEXTO DEL BOTÓN */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    🔘 Texto del botón (máx. 20 caracteres)
                </Label>
                <Input
                    value={decodeURIComponent(
                        list.globalButtons?.[0]?.title || ''
                    )}
                    onChange={(e) => handleButtonTitleChange(e.target.value)}
                    placeholder="Ej: Elegir opción"
                    className="mt-1 text-xs"
                />
            </section>

            {/* 💬 BODY */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Mensaje principal (body.text)
                </Label>
                <Textarea
                    value={decodeURIComponent(list.body || '')}
                    onChange={(e) =>
                        handleBodyChange(encodeURIComponent(e.target.value))
                    }
                    placeholder="Texto principal..."
                    rows={4}
                    className="mt-1 font-mono text-xs"
                />
                <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>
                        {decodeURIComponent(list.body || '').length} / 1024
                        caracteres
                    </span>
                </div>
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
                        setAccordionValue(['connections'])
                        toast.success('Opciones guardadas correctamente.')
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
                            className="rounded-lg border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-700 dark:bg-gray-900/40"
                        >
                            <Label className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                                🏷️ Grupo {itemIdx + 1}
                            </Label>
                            <Input
                                value={decodeURIComponent(item.title || '')}
                                onChange={(e) => {
                                    const val = e.target.value
                                    if (val.length > 24) {
                                        toast.warning(
                                            'Máx. 24 caracteres en título del grupo.'
                                        )
                                        return
                                    }
                                    updateInteractive((d) => {
                                        d.items[itemIdx].title =
                                            encodeURIComponent(val)
                                    })
                                }}
                                placeholder="Título del grupo..."
                                className="mt-1 text-xs"
                            />

                            <Accordion
                                type="multiple"
                                value={accordionValue}
                                onValueChange={(v) =>
                                    setAccordionValue(v as string[])
                                }
                                className="mt-2"
                            >
                                {/* ✏️ Editar opciones */}
                                <AccordionItem value="options-edit">
                                    <AccordionTrigger className="rounded-md bg-blue-100/70 px-3 py-2 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        ✏️ Editar opciones (
                                        {localOptions.length})
                                    </AccordionTrigger>
                                    <AccordionContent className="mt-2 space-y-3 px-1">
                                        <div className="flex justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={
                                                    localOptions.length >= 10
                                                }
                                                onClick={() => {
                                                    if (
                                                        localOptions.length >=
                                                        10
                                                    ) {
                                                        toast.warning(
                                                            'Máximo 10 opciones permitidas.'
                                                        )
                                                        return
                                                    }
                                                    const next = DIGITS.find(
                                                        (d) =>
                                                            !usedDigits.has(d)
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
                                                className="border-blue-600 bg-blue-600 text-white hover:bg-blue-500"
                                            >
                                                <Plus className="mr-1 h-4 w-4" />{' '}
                                                Añadir opción
                                            </Button>
                                        </div>

                                        {localOptions.map((opt, optIdx) => {
                                            const titleDecoded =
                                                decodeURIComponent(
                                                    opt.title || ''
                                                )
                                            const descDecoded =
                                                decodeURIComponent(
                                                    opt.description || ''
                                                )
                                            const titleInvalid =
                                                titleDecoded.length > 24
                                            const descTooLong =
                                                descDecoded.length > 72

                                            return (
                                                <div
                                                    key={optIdx}
                                                    className="rounded-md border border-blue-200 bg-white/80 p-3 text-xs shadow-sm transition-all hover:shadow-md dark:border-blue-700 dark:bg-gray-950"
                                                >
                                                    <div className="mb-1 flex items-center justify-between">
                                                        <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
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

                                                    <div className="flex items-start gap-3">
                                                        <div className="w-fit">
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
                                                                        (
                                                                            prev
                                                                        ) =>
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
                                                                <SelectTrigger className="h-8 border-blue-400 text-xs">
                                                                    <SelectValue placeholder="N°" />
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
                                                                                {
                                                                                    d
                                                                                }
                                                                            </SelectItem>
                                                                        )
                                                                    )}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        <div className="flex-1">
                                                            <Label className="text-[10px] text-gray-500">
                                                                title
                                                            </Label>
                                                            <Input
                                                                value={
                                                                    titleDecoded
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const val =
                                                                        e.target
                                                                            .value
                                                                    if (
                                                                        val.length >
                                                                        24
                                                                    ) {
                                                                        toast.warning(
                                                                            'Máx. 24 caracteres en título.'
                                                                        )
                                                                        return
                                                                    }
                                                                    setLocalOptions(
                                                                        (
                                                                            prev
                                                                        ) =>
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
                                                                                                  val
                                                                                              ),
                                                                                          }
                                                                                        : o
                                                                            )
                                                                    )
                                                                }}
                                                                placeholder="Ej: Servicio Técnico"
                                                                className="text-xs"
                                                            />
                                                            {titleInvalid && (
                                                                <p className="mt-1 text-[10px] text-red-500">
                                                                    ❌ Máx. 24
                                                                    caracteres.
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="mt-2">
                                                        <Label className="text-[10px] text-gray-500">
                                                            description
                                                            (opcional)
                                                        </Label>
                                                        <Input
                                                            value={descDecoded}
                                                            onChange={(e) => {
                                                                const val =
                                                                    e.target
                                                                        .value
                                                                if (
                                                                    val.length >
                                                                    72
                                                                ) {
                                                                    toast.warning(
                                                                        'Máx. 72 caracteres en descripción.'
                                                                    )
                                                                    return
                                                                }
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
                                                                                                  val
                                                                                              ),
                                                                                      }
                                                                                    : o
                                                                        )
                                                                )
                                                            }}
                                                            placeholder="Descripción de la opción..."
                                                            className="text-xs"
                                                        />
                                                        {descTooLong && (
                                                            <p className="text-[10px] text-yellow-500">
                                                                ⚠️ Máx. 72
                                                                caracteres
                                                                sugerido.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}

                                        <div className="flex justify-end pt-2">
                                            <Button
                                                onClick={handleSaveOptions}
                                                className="bg-blue-600 text-white hover:bg-blue-700"
                                            >
                                                💾 Guardar opciones y ver
                                                conexiones
                                            </Button>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>

                                {/* 🔗 Conexiones */}
                                <AccordionItem value="connections">
                                    <AccordionTrigger className="rounded-md bg-blue-100/60 px-3 py-2 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                        🔗 Conexiones de opciones
                                    </AccordionTrigger>
                                    <AccordionContent className="mt-2">
                                        <DynamicNodeConnectionsAccordion
                                            nodeId={id}
                                            variant="list"
                                            options={item.options.map(
                                                (opt) => ({
                                                    id: opt.postbackText,
                                                    label:
                                                        decodeURIComponent(
                                                            opt.title || ''
                                                        ) || opt.postbackText,
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
                                                            value as string
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
