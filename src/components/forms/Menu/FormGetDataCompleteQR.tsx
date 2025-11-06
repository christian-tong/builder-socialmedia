// src/components/forms/Menu/FormGetDataCompleteQR.tsx
'use client'

import React, { useEffect, useCallback, useState, useRef } from 'react'
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
 * 💬 FormGetDataCompleteQR (v4.7 — Visual Refactor + Responsive Layout)
 * -----------------------------------------------------------------------
 * ✅ Layout mejorado: title ocupa todo el espacio restante
 * ✅ Compacto y limpio: postbackText ancho fijo, description full width
 * ✅ Validaciones WhatsApp Quick Reply (máx. 3 botones)
 * ✅ AutoGrow dinámico (altura ajustable sin ancho infinito)
 * ✅ Validaciones con debounce 3s
 * ✅ Toasts shadcn/sonner
 */
export function FormGetDataCompleteQR({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { updateField, toggleSaveHidden } = useGetDataCompleteQRStore()
    const nodeData = getNodeData(id)
    if (nodeData.interactive?.type !== 'quick_reply') return null

    const qr = nodeData.interactive as QuickReplyInteractive
    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const
    const [accordionValue, setAccordionValue] = useState<string[]>([
        'options-edit',
    ])
    const debounceRef = useRef<NodeJS.Timeout | null>(null)

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

    /* -------------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE                                                            */
    /* -------------------------------------------------------------------------- */
    const baseFields = [
        { key: 'condition', label: '🧩 Condition', placeholder: '[1-3]' },
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

    /* -------------------------------------------------------------------------- */
    /* 💬 BODY (content.text)                                                    */
    /* -------------------------------------------------------------------------- */
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    const autoResizeTextarea = () => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = `${el.scrollHeight}px`
    }
    const handleContentTextChange = (value: string) => {
        // 🚫 Bloquea cualquier caracter adicional
        if (value.length > 1024) {
            toast.warning('Máximo 1024 caracteres permitidos.')
            return
        }

        updateInteractive((d) => (d.content.text = value))
        autoResizeTextarea()

        // 🔁 Reinicia debounce de validación
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => {
            if (value.length > 1024) {
                toast.error(
                    'El texto del cuerpo no puede exceder 1024 caracteres.'
                )
            }
        }, 3000)
    }

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
                    ref={textareaRef}
                    value={qr.content.text || ''}
                    onChange={(e) => handleContentTextChange(e.target.value)}
                    placeholder="Texto principal..."
                    rows={4}
                />
                <div className="mt-1 flex justify-between text-[10px] text-gray-400">
                    <span>
                        {qr.content.text?.length || 0} / 1024 caracteres
                    </span>
                </div>
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
                            <AccordionContent className="mt-2 space-y-3 px-1">
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={qr.options.length >= 3}
                                        onClick={() => {
                                            if (qr.options.length >= 3) {
                                                toast.warning(
                                                    'Máximo 3 opciones permitidas.'
                                                )
                                                return
                                            }
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
                                        className={`border-purple-600 ${
                                            qr.options.length >= 3
                                                ? 'cursor-not-allowed bg-gray-400 text-white'
                                                : 'bg-purple-600 text-white hover:bg-purple-500'
                                        }`}
                                    >
                                        <Plus className="mr-1 h-4 w-4" />
                                        Añadir opción
                                    </Button>
                                </div>

                                {qr.options.map((opt, optIdx) => {
                                    const titleDecoded = decodeURIComponent(
                                        opt.title || ''
                                    )
                                    const descDecoded = decodeURIComponent(
                                        opt.description || ''
                                    )
                                    const titleInvalid =
                                        titleDecoded.length > 20 ||
                                        /[\p{Emoji_Presentation}\p{Emoji}\u200d]/u.test(
                                            titleDecoded
                                        )
                                    const descTooLong = descDecoded.length > 72

                                    const debouncedValidate = (
                                        fn: () => void
                                    ) => {
                                        if (debounceRef.current)
                                            clearTimeout(debounceRef.current)
                                        debounceRef.current = setTimeout(
                                            fn,
                                            3000
                                        )
                                    }

                                    return (
                                        <div
                                            key={optIdx}
                                            className="rounded-md border border-purple-200 bg-white/80 p-3 text-xs shadow-sm transition-all hover:shadow-md dark:border-purple-700 dark:bg-gray-950"
                                        >
                                            <div className="mb-1 flex items-center justify-between">
                                                <Label className="text-[11px] font-medium text-gray-600 dark:text-gray-300">
                                                    Opción {optIdx + 1}
                                                </Label>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        updateInteractive(
                                                            (d) => {
                                                                d.options.splice(
                                                                    optIdx,
                                                                    1
                                                                )
                                                            }
                                                        )
                                                        triggerAfterSave(id)
                                                    }}
                                                    className="h-5 w-5 text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>

                                            {/* Línea superior */}
                                            <div className="flex items-start gap-3">
                                                <div className="w-fit">
                                                    <Label className="text-[10px] text-gray-500">
                                                        postbackText
                                                    </Label>
                                                    <Select
                                                        value={opt.postbackText}
                                                        onValueChange={(
                                                            digit
                                                        ) =>
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
                                                            <SelectValue placeholder="N°" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {DIGITS.map((d) => (
                                                                <SelectItem
                                                                    key={d}
                                                                    value={d}
                                                                    disabled={qr.options.some(
                                                                        (
                                                                            o,
                                                                            i
                                                                        ) =>
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

                                                <div className="flex-1">
                                                    <Label className="text-[10px] text-gray-500">
                                                        title
                                                    </Label>
                                                    <Input
                                                        value={titleDecoded}
                                                        onChange={(e) => {
                                                            const value =
                                                                e.target.value
                                                            updateInteractive(
                                                                (d) => {
                                                                    d.options[
                                                                        optIdx
                                                                    ].title =
                                                                        encodeURIComponent(
                                                                            value
                                                                        )
                                                                }
                                                            )
                                                            debouncedValidate(
                                                                () => {
                                                                    if (
                                                                        value.length >
                                                                        20
                                                                    ) {
                                                                        toast.error(
                                                                            'Máx. 20 caracteres en título.'
                                                                        )
                                                                    } else if (
                                                                        /[\p{Emoji_Presentation}\p{Emoji}\u200d]/u.test(
                                                                            value
                                                                        )
                                                                    ) {
                                                                        toast.error(
                                                                            'No se permiten emojis en título.'
                                                                        )
                                                                    }
                                                                }
                                                            )
                                                        }}
                                                        placeholder="Ej: Soporte técnico"
                                                        className="text-xs"
                                                    />
                                                    {titleInvalid && (
                                                        <p className="mt-1 text-[10px] text-red-500">
                                                            ❌ Máx. 20
                                                            caracteres y sin
                                                            emojis.
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Descripción */}
                                            <div className="mt-2">
                                                <Label className="text-[10px] text-gray-500">
                                                    description
                                                </Label>
                                                <Input
                                                    value={descDecoded}
                                                    onChange={(e) => {
                                                        const val =
                                                            e.target.value
                                                        updateInteractive(
                                                            (d) => {
                                                                d.options[
                                                                    optIdx
                                                                ].description =
                                                                    encodeURIComponent(
                                                                        val
                                                                    )
                                                            }
                                                        )
                                                        debouncedValidate(
                                                            () => {
                                                                if (
                                                                    val.length >
                                                                    72
                                                                ) {
                                                                    toast.warning(
                                                                        'Máx. 72 caracteres en descripción.'
                                                                    )
                                                                }
                                                            }
                                                        )
                                                    }}
                                                    placeholder="Descripción..."
                                                    className="text-xs"
                                                />
                                                {descTooLong && (
                                                    <p className="text-[10px] text-yellow-500">
                                                        ⚠️ Máx. 72 caracteres
                                                        sugerido.
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}

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
