// src/components/forms/Menu/FormGetDataCompleteQR.tsx

'use client'

import React, { useEffect, useMemo } from 'react'
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
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { OptionFlowManager } from '@/components/shared/OptionFlowManager'
import type {
    QuickReplyInteractive,
    QuickReplyOption,
} from '@/types/getDataComplete'

/**
 * 💬 FormGetDataCompleteQR (v2.3 OptionFlow + EdgeSync)
 * ------------------------------------------------------------
 * - Cada opción puede tener su conexión individual (nextNodeId)
 * - Crea edges automáticos al seleccionar el nodo siguiente
 * - Llama al callback global `triggerAfterSave(id)` para mantener la vista sincronizada
 * - Sin duplicar conexiones (usa createConnectionIfMissing)
 */
export function FormGetDataCompleteQR({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { availableNodes, createConnectionIfMissing } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    const interactive = nodeData.interactive
    if (interactive.type !== 'quick_reply') return null

    const qr: QuickReplyInteractive = interactive
    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

    // 🧠 Dígitos usados actualmente
    const usedDigits = useMemo(
        () => new Set(qr.options.map((o) => o.postbackText)),
        [qr.options]
    )

    // ➕ Calcula siguiente número disponible
    const nextAvailableDigit = useMemo(
        () => DIGITS.find((d) => !usedDigits.has(d)),
        [usedDigits]
    )

    // ✅ Inicializa con una opción si está vacío
    useEffect(() => {
        if (qr.options.length === 0) {
            const first: QuickReplyOption = {
                postbackText: '1',
                type: 'text',
                title: '',
                nextNodeId: undefined,
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

    // 🔄 Función inmutable para actualizar interactive
    const updateInteractive = (
        updater: (draft: QuickReplyInteractive) => void
    ) => {
        const draft: QuickReplyInteractive = {
            ...qr,
            content: { ...qr.content },
            options: qr.options.map((o) => ({ ...o })),
        }
        updater(draft)
        setNodeData(id, { interactive: draft })
    }

    /** 🧾 Cambios generales */
    const handleMsgIdChange = (value: string) =>
        updateInteractive((d) => (d.msgid = value))

    const handleContentTextChange = (value: string) =>
        updateInteractive((d) => (d.content.text = value))

    /** 🔢 Cambiar dígito de opción */
    const handleChangeOptionDigit = (index: number, digit: string) => {
        updateInteractive((d) => {
            const current = d.options[index]
            d.options[index] = { ...current, postbackText: digit, type: 'text' }
        })
        triggerAfterSave(id)
    }

    /** ✍️ Editar campo genérico de opción */
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

    /** 🧭 Seleccionar nodo siguiente → crea edge automático */
    const handleSelectNextNode = (index: number, targetId: string) => {
        updateInteractive((d) => {
            const opt = d.options[index]
            opt.nextNodeId = targetId

            if (targetId) {
                // 🔗 Crea conexión visual si no existe
                createConnectionIfMissing(targetId, opt.postbackText)
            }
        })

        // 🚀 Ejecuta el callback global (crea edges pendientes si los hay)
        triggerAfterSave(id)
    }

    /** ➕ Añadir nueva opción */
    const addOption = () => {
        if (!nextAvailableDigit) return
        updateInteractive((d) => {
            d.options.push({
                postbackText: nextAvailableDigit,
                type: 'text',
                title: '',
                nextNodeId: undefined,
            })
        })
        triggerAfterSave(id)
    }

    /** 🗑️ Eliminar opción */
    const removeOption = (index: number) => {
        updateInteractive((d) => {
            d.options.splice(index, 1)
        })
        triggerAfterSave(id)
    }

    // 🧱 Renderizado
    return (
        <div className="mt-6 space-y-4">
            {/* 🧾 Configuración general */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Quick Reply – Configuración
                </Label>
            </div>

            {/* msgid */}
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">msgid</Label>
                <Input
                    value={qr.msgid}
                    onChange={(e) => handleMsgIdChange(e.target.value)}
                    placeholder="qr1, qr_default, ..."
                    className="text-sm"
                />
            </div>

            {/* content.text */}
            <div className="space-y-1">
                <Label className="text-xs text-gray-500">content.text</Label>
                <Textarea
                    value={qr.content.text}
                    onChange={(e) => handleContentTextChange(e.target.value)}
                    placeholder="¡Hola (WABANAME)! ¿En qué puedo ayudarte?"
                    rows={4}
                    className="font-mono text-xs"
                />
            </div>

            {/* 🔘 Opciones dinámicas */}
            <div className="space-y-3">
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
                                {/* postbackText */}
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

                                {/* title */}
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
                                    deferred={true}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
