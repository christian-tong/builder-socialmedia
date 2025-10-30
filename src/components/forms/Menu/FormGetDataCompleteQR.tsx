// src/components/forms/Menu/FormGetDataCompleteQR.tsx
'use client'

import React, { useEffect, useMemo, useCallback } from 'react'
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
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { OptionFlowManager } from '@/components/shared/OptionFlowManager'
import type {
    QuickReplyInteractive,
    QuickReplyOption,
} from '@/types/getDataComplete'

/**
 * 💬 FormGetDataCompleteQR (v3.6 — Campos base + SaveHidden + OptionFlow)
 * ------------------------------------------------------------
 * - Control completo de configuración QR
 * - Campos base: condition, groodText, setvar, variable, alias, iterations, timeOut
 * - SaveHidden con Switch estilo Bootstrap
 * - Manejo de opciones con conexión visual individual
 */
export function FormGetDataCompleteQR({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { availableNodes, createConnectionIfMissing } = useNodeConnections(id)
    const { updateField, updateSetVariables, toggleSaveHidden } =
        useGetDataCompleteQRStore()

    const nodeData = getNodeData(id)
    const interactive = nodeData.interactive
    if (!interactive || interactive.type !== 'quick_reply') return null

    const qr = interactive as QuickReplyInteractive
    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

    // 🧠 dígitos usados
    const usedDigits = useMemo(
        () => new Set(qr.options.map((o) => o.postbackText)),
        [qr.options]
    )
    const nextAvailableDigit = useMemo(
        () => DIGITS.find((d) => !usedDigits.has(d)),
        [usedDigits]
    )

    // ✅ inicialización mínima
    useEffect(() => {
        if (qr.options.length === 0) {
            const first: QuickReplyOption = {
                postbackText: '1',
                type: 'text',
                title: '',
            }
            const updated: QuickReplyInteractive = {
                ...qr,
                options: [first],
                type: 'quick_reply',
                msgid: qr.msgid || 'qr_default',
                content: { ...qr.content, type: 'text' },
            }
            setNodeData(id, { interactive: updated })
        }
    }, [])

    // 🔄 actualización segura
    const updateInteractive = useCallback(
        (updater: (draft: QuickReplyInteractive) => void) => {
            const draft: QuickReplyInteractive = {
                ...qr,
                content: { ...qr.content },
                options: qr.options.map((o) => ({ ...o })),
            }
            updater(draft)
            setNodeData(id, { interactive: draft })
        },
        [qr, setNodeData, id]
    )

    /* -------------------------------------------------------------------------- */
    /* 🧱 CAMPOS BASE DEL NODO                                                    */
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

    /* -------------------------------------------------------------------------- */
    /* 🧩 INTERACTIVE BODY                                                       */
    /* -------------------------------------------------------------------------- */
    const handleMsgIdChange = (value: string) =>
        updateInteractive((d) => (d.msgid = value))

    const handleContentTextChange = (value: string) =>
        updateInteractive((d) => (d.content.text = value))

    /* -------------------------------------------------------------------------- */
    /* 🔘 OPCIONES QUICK REPLY                                                   */
    /* -------------------------------------------------------------------------- */
    const handleChangeOptionDigit = (index: number, digit: string) => {
        updateInteractive((d) => {
            const current = d.options[index]
            d.options[index] = { ...current, postbackText: digit, type: 'text' }
        })
        triggerAfterSave(id)
    }

    const handleChangeOption = (
        index: number,
        field: keyof QuickReplyOption,
        value: string
    ) => {
        updateInteractive((d) => {
            const current = d.options[index]
            d.options[index] = { ...current, [field]: value, type: 'text' }
        })
    }

    const handleSelectNextNode = (index: number, targetId: string) => {
        updateInteractive((d) => {
            const opt = d.options[index]
            ;(opt as any).nextNodeId = targetId
            if (targetId) createConnectionIfMissing(targetId, opt.postbackText)
        })
        triggerAfterSave(id)
    }

    const addOption = () => {
        if (!nextAvailableDigit) return
        updateInteractive((d) => {
            d.options.push({
                postbackText: nextAvailableDigit,
                type: 'text',
                title: '',
            })
        })
        triggerAfterSave(id)
    }

    const removeOption = (index: number) => {
        updateInteractive((d) => {
            d.options.splice(index, 1)
        })
        triggerAfterSave(id)
    }

    /* -------------------------------------------------------------------------- */
    /* 🧱 RENDER                                                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="mt-6 space-y-6">
            {/* ⚙️ CONFIGURACIÓN BASE */}
            <section className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ⚙️ Configuración base del nodo
                </Label>

                {/* 🔒 SaveHidden */}
                <div className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900/40">
                    <Switch
                        checked={!!nodeData.saveHidden}
                        onCheckedChange={handleToggleSaveHidden}
                    />
                    <Label className="text-sm text-gray-700 dark:text-gray-300">
                        🔒 Guardar oculto (saveHidden)
                    </Label>
                </div>

                {/* Campos base */}
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

            {/* 💬 CONTENIDO PRINCIPAL */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Mensaje principal (content.text)
                </Label>
                <Textarea
                    value={qr.content.text}
                    onChange={(e) => handleContentTextChange(e.target.value)}
                    placeholder="¡Hola (WABANAME)! ¿En qué puedo ayudarte?"
                    rows={4}
                    className="font-mono text-xs"
                />
            </section>

            {/* 🧩 OPCIONES */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Opciones (postbackText / title / conexión)
                    </Label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                        disabled={!nextAvailableDigit}
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 disabled:opacity-50"
                    >
                        <Plus className="mr-1 h-4 w-4" />
                        {nextAvailableDigit ? `Agregar` : 'Sin dígitos libres'}
                    </Button>
                </div>

                <div className="space-y-4">
                    {qr.options.map((opt, index) => (
                        <div
                            key={index}
                            className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                        >
                            <div className="mb-2 flex items-center justify-between">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    Opción {index + 1}
                                </Label>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeOption(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <Label className="text-xs text-gray-500">
                                        postbackText
                                    </Label>
                                    <Select
                                        value={opt.postbackText}
                                        onValueChange={(digit) =>
                                            handleChangeOptionDigit(
                                                index,
                                                digit
                                            )
                                        }
                                    >
                                        <SelectTrigger className="h-9 w-full border-emerald-500 text-sm">
                                            <SelectValue placeholder="Seleccionar..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DIGITS.map((d) => (
                                                <SelectItem
                                                    key={d}
                                                    value={d}
                                                    disabled={
                                                        usedDigits.has(d) &&
                                                        opt.postbackText !== d
                                                    }
                                                >
                                                    {d}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-2">
                                    <Label className="text-xs text-gray-500">
                                        title
                                    </Label>
                                    <Input
                                        value={opt.title}
                                        onChange={(e) =>
                                            handleChangeOption(
                                                index,
                                                'title',
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ej: Quiero un servicio"
                                    />
                                </div>
                            </div>

                            {/* 🧭 Conexión individual */}
                            <div className="mt-3">
                                <OptionFlowManager
                                    id={id}
                                    optionKey={opt.postbackText}
                                    selectedId={opt.nextNodeId}
                                    onSelect={(targetId) =>
                                        handleSelectNextNode(index, targetId)
                                    }
                                    availableNodes={availableNodes}
                                    accentColor="text-emerald-600"
                                    deferred
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
