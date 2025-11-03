// src/components/forms/Menu/FormGetDataCompleteQR.tsx

// src/components/forms/Menu/FormGetDataCompleteQR.tsx
'use client'

import React, { useEffect, useMemo, useCallback, useState } from 'react'
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
import { Plus, Trash2 } from 'lucide-react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useGetDataCompleteQRStore } from '@/store/GetDataComplete/useGetDataCompleteQRStore'
import type { QuickReplyInteractive } from '@/types/getDataComplete'
import { DynamicNodeConnectionsAccordion } from '@/components/shared/DynamicNodeConnectionsAccordion'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'

/**
 * 💬 FormGetDataCompleteQR (v4.4 — AutoAccordionSwitch + TypeSafe Sync)
 * -----------------------------------------------------------------------
 * ✅ DualAccordion (Editar opciones / Conexiones)
 * ✅ Al guardar opciones → se abre el acordeón de Conexiones
 * ✅ Usa DynamicNodeConnectionsAccordion v1.3
 * ✅ Paleta morado/verde (QuickReply Theme)
 * ✅ Patrón de sincronización diferida
 */
export function FormGetDataCompleteQR({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { updateField, toggleSaveHidden } = useGetDataCompleteQRStore()
    const nodeData = getNodeData(id)
    if (nodeData.interactive?.type !== 'quick_reply') return null

    const qr = nodeData.interactive as QuickReplyInteractive
    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

    // Estado controlado de acordeones
    const [accordionValue, setAccordionValue] = useState<string[]>([
        'options-edit',
    ])

    /** 🧱 Inicialización mínima */
    useEffect(() => {
        if (!qr.options?.length) {
            const updated: QuickReplyInteractive = {
                ...qr,
                type: 'quick_reply',
                content: {
                    ...qr.content,
                    type: 'text',
                    text: qr.content?.text || '',
                },
                options: [
                    {
                        postbackText: '1',
                        title: '',
                        type: 'text',
                        description: '',
                    },
                ],
            }
            setNodeData(id, { interactive: updated })
        }
    }, [])

    /** 🔄 Actualización inmutable */
    const updateInteractive = useCallback(
        (updater: (draft: QuickReplyInteractive) => void) => {
            const copy: QuickReplyInteractive = {
                ...qr,
                content: { ...qr.content },
                options: qr.options.map((o) => ({ ...o })),
                conditions: { ...(qr.conditions || {}) },
            }
            updater(copy)
            setNodeData(id, { interactive: copy })
        },
        [qr, setNodeData, id]
    )

    /* 🧩 Sincroniza condiciones importadas (v4.4 — TypeSafe Sync) */
    useEffect(() => {
        const conditions: Record<string, string> =
            nodeData?.conditions ||
            (qr?.conditions as Record<string, string>) ||
            {}

        if (!qr.options?.length || !Object.keys(conditions).length) return

        updateInteractive((draft) => {
            draft.options = draft.options.map((opt) => ({
                ...opt,
                nextNodeId:
                    conditions?.[opt.postbackText] ||
                    opt.nextNodeId ||
                    undefined,
            }))
        })
    }, [])

    /* -------------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE                                                            */
    /* -------------------------------------------------------------------------- */
    const baseFields = [
        { key: 'condition', label: '🧩 Condition', placeholder: '[1-3]' },
        {
            key: 'groodText',
            label: '💬 GroodText',
            placeholder: 'Texto positivo...',
        },
        { key: 'setvar', label: '🏷️ SetVar', placeholder: 'PRIMER_NIVEL' },
        { key: 'variable', label: '🔡 Variable', placeholder: 'PrimeraOpcion' },
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

    const handleContentTextChange = (value: string) =>
        updateInteractive((d) => (d.content.text = value))

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
                    💬 Mensaje principal (content.text)
                </Label>
                <Textarea
                    value={qr.content.text || ''}
                    onChange={(e) => handleContentTextChange(e.target.value)}
                    placeholder="Texto principal..."
                    rows={3}
                    className="mt-1 font-mono text-xs"
                />
            </section>

            {/* 🧩 OPCIONES QUICK REPLY */}
            <section className="space-y-6">
                <div className="rounded-lg border border-gray-200 bg-gray-50/60 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                    <Label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                        💬 Opciones de respuesta rápida
                    </Label>

                    <Accordion
                        type="multiple"
                        value={accordionValue}
                        onValueChange={(val) =>
                            setAccordionValue(val as string[])
                        }
                        className="mt-2"
                    >
                        {/* ✏️ Edición de opciones */}
                        <AccordionItem value="options-edit">
                            <AccordionTrigger className="rounded-md bg-purple-100/70 px-3 py-2 text-xs text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                                ✏️ Editar opciones ({qr.options.length})
                            </AccordionTrigger>
                            <AccordionContent className="mt-2 space-y-3">
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            const used = new Set(
                                                qr.options.map(
                                                    (o) => o.postbackText
                                                )
                                            )
                                            const next = DIGITS.find(
                                                (d) => !used.has(d)
                                            )
                                            if (!next) return
                                            updateInteractive((d) => {
                                                d.options.push({
                                                    postbackText: next,
                                                    type: 'text',
                                                    title: '',
                                                    description: '',
                                                })
                                            })
                                            triggerAfterSave(id)
                                        }}
                                        className="border-purple-600 bg-purple-600 text-white hover:bg-purple-500 hover:text-white"
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Añadir opción
                                    </Button>
                                </div>

                                {qr.options.map((opt, optIdx) => (
                                    <div
                                        key={optIdx}
                                        className="rounded-md border border-purple-200 bg-white/80 p-2 text-xs shadow-sm dark:border-purple-700 dark:bg-gray-950"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] text-gray-500">
                                                Opción {optIdx + 1}
                                            </Label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    updateInteractive((d) => {
                                                        d.options.splice(
                                                            optIdx,
                                                            1
                                                        )
                                                    })
                                                    triggerAfterSave(id)
                                                }}
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
                                                    value={opt.postbackText}
                                                    onValueChange={(digit) =>
                                                        updateInteractive(
                                                            (d) => {
                                                                d.options[
                                                                    optIdx
                                                                ].postbackText =
                                                                    digit
                                                            }
                                                        )
                                                    }
                                                >
                                                    <SelectTrigger className="h-8 border-purple-400 text-xs">
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DIGITS.map((d) => (
                                                            <SelectItem
                                                                key={d}
                                                                value={d}
                                                                disabled={qr.options.some(
                                                                    (o, i) =>
                                                                        o.postbackText ===
                                                                            d &&
                                                                        i !==
                                                                            optIdx
                                                                )}
                                                            >
                                                                {d}
                                                            </SelectItem>
                                                        ))}
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
                                                        updateInteractive(
                                                            (d) => {
                                                                d.options[
                                                                    optIdx
                                                                ].title =
                                                                    encodeURIComponent(
                                                                        e.target
                                                                            .value
                                                                    )
                                                            }
                                                        )
                                                    }
                                                    placeholder="Ej: Soporte técnico"
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
                                                    opt.description || ''
                                                )}
                                                onChange={(e) =>
                                                    updateInteractive((d) => {
                                                        d.options[
                                                            optIdx
                                                        ].description =
                                                            encodeURIComponent(
                                                                e.target.value
                                                            )
                                                    })
                                                }
                                                placeholder="Descripción..."
                                                className="text-xs"
                                            />
                                        </div>
                                    </div>
                                ))}

                                <div className="flex justify-end pt-2">
                                    <Button
                                        onClick={() => {
                                            triggerAfterSave(id)
                                            setAccordionValue(['connections'])
                                        }}
                                        className="bg-purple-600 text-white hover:bg-purple-700"
                                    >
                                        💾 Guardar opciones y ver conexiones
                                    </Button>
                                </div>
                            </AccordionContent>
                        </AccordionItem>

                        {/* 🔗 Conexiones */}
                        <AccordionItem value="connections">
                            <AccordionTrigger className="rounded-md bg-emerald-100/60 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                                🔗 Conexiones de opciones
                            </AccordionTrigger>
                            <AccordionContent className="mt-2">
                                <DynamicNodeConnectionsAccordion
                                    nodeId={id}
                                    variant="quick_reply"
                                    options={qr.options.map((opt) => ({
                                        id: opt.postbackText,
                                        label:
                                            decodeURIComponent(
                                                opt.title || ''
                                            ) || opt.postbackText,
                                        nextNodeId: opt.nextNodeId,
                                    }))}
                                    onUpdateOption={(optionId, key, value) =>
                                        updateInteractive((d) => {
                                            const option = d.options.find(
                                                (o) =>
                                                    o.postbackText === optionId
                                            )
                                            if (option)
                                                (option as any)[key] = value
                                            if (!d.conditions) d.conditions = {}
                                            if (value)
                                                d.conditions[optionId] =
                                                    value as string
                                            else delete d.conditions[optionId]
                                        })
                                    }
                                />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            </section>
        </div>
    )
}
