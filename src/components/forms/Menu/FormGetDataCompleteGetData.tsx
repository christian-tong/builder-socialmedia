// src/components/forms/Menu/FormGetDataCompleteGetData.tsx

'use client'

import React, { useCallback, useState, useEffect } from 'react'
import {
    Label,
    Input,
    Textarea,
    Switch,
    Button,
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useGetDataCompleteGetDataStore } from '@/store/GetDataComplete/useGetDataCompleteGetDataStore'
import { DynamicNodeConnectionsAccordion } from '@/components/shared/DynamicNodeConnectionsAccordion'

/**
 * 🧾 FormGetDataCompleteGetData (v4.6 — AutoAccordionSwitch + NumericSelect Sync)
 * --------------------------------------------------------------------
 * ✅ Patrón unificado con QuickReply v4.4
 * ✅ DualAccordion (Editar / Conexiones)
 * ✅ Numeración automática (1–9,0) sin duplicados
 * ✅ Guardar opciones → abre Conexiones
 * ✅ Tema Amber (GetData Variant)
 */
export function FormGetDataCompleteGetData({ id }: { id: string }) {
    const { getNodeData, triggerAfterSave } = useGetDataCompleteBaseStore()
    const {
        updatePrompt,
        updateField,
        toggleSaveHidden,
        addSetVariable,
        updateSetVariable,
        removeSetVariable,
    } = useGetDataCompleteGetDataStore()

    const nodeData = getNodeData(id)
    const [accordionValue, setAccordionValue] = useState<string[]>(['edit'])

    const DIGITS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'] as const

    /* -------------------------------------------------------------------------- */
    /* 🧱 Campos base comunes                                                     */
    /* -------------------------------------------------------------------------- */
    const baseFields = [
        {
            key: 'condition',
            label: '🧩 Condition',
            placeholder: '^(?!.*timeout).*',
        },
        { key: 'setvar', label: '🏷️ SetVar', placeholder: 'RESULTADO' },
        { key: 'variable', label: '🔡 Variable', placeholder: 'DatoObtenido' },
        { key: 'alias', label: '🪪 Alias', placeholder: 'Alias descriptivo' },
        { key: 'iterations', label: '🔁 Iterations', placeholder: '1' },
        { key: 'timeOut', label: '⏱️ Timeout (ms)', placeholder: '60000' },
    ] as const

    const handleFieldChange = useCallback(
        (field: string, val: string) => {
            updateField(id, field as any, val)
            triggerAfterSave(id)
        },
        [id, updateField, triggerAfterSave]
    )

    const handleToggleSaveHidden = useCallback(
        (checked: boolean) => {
            toggleSaveHidden(id, checked)
            triggerAfterSave(id)
        },
        [id, toggleSaveHidden, triggerAfterSave]
    )

    /* -------------------------------------------------------------------------- */
    /* 🧠 Efecto inicial: crear setvariables vacío si no existe                   */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        if (!nodeData.setvariables) nodeData.setvariables = {}
    }, [nodeData])

    /* -------------------------------------------------------------------------- */
    /* 🧱 Render                                                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="mt-6 space-y-6">
            {/* ⚙️ CONFIGURACIÓN BASE DEL NODO */}
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
                                    handleFieldChange(f.key, e.target.value)
                                }
                                placeholder={f.placeholder}
                                className="text-xs"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* 💬 DESCRIPCIÓN */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Descripción
                </Label>
                <Textarea
                    value={decodeURIComponent(nodeData.prompt || '')}
                    onChange={(e) => {
                        updatePrompt(id, e.target.value)
                        triggerAfterSave(id)
                    }}
                    placeholder="Ej: Confirmación de correo..."
                    rows={3}
                    className="font-mono text-xs"
                />
            </section>

            {/* 🧩 OPCIONES */}
            <section className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-700 dark:bg-amber-900/10">
                <Label className="text-xs font-semibold text-amber-700 dark:text-amber-300">
                    ⚡ Opciones y condiciones
                </Label>

                <Accordion
                    type="multiple"
                    value={accordionValue}
                    onValueChange={(val) => setAccordionValue(val as string[])}
                    className="mt-2"
                >
                    {/* ✏️ Edición de opciones */}
                    <AccordionItem value="edit">
                        <AccordionTrigger className="rounded-md bg-amber-100/70 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                            ✏️ Editar opciones (
                            {Object.keys(nodeData.setvariables || {}).length})
                        </AccordionTrigger>
                        <AccordionContent className="mt-2 space-y-3">
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        const used = new Set(
                                            Object.keys(
                                                nodeData.setvariables || {}
                                            )
                                        )
                                        const next = DIGITS.find(
                                            (d) => !used.has(d)
                                        )
                                        if (!next) return
                                        addSetVariable(id)
                                        // sincroniza el nuevo campo
                                        updateSetVariable(
                                            id,
                                            next,
                                            encodeURIComponent('')
                                        )
                                        triggerAfterSave(id)
                                    }}
                                    className="border-amber-600 bg-amber-600 text-white hover:bg-amber-500 hover:text-white"
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Añadir
                                    opción
                                </Button>
                            </div>

                            {Object.entries(nodeData.setvariables || {}).map(
                                ([key, val], idx) => (
                                    <div
                                        key={key}
                                        className="rounded-md border border-amber-200 bg-white/80 p-2 text-xs shadow-sm dark:border-amber-700 dark:bg-gray-950"
                                    >
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] text-gray-500">
                                                Opción {idx + 1}
                                            </Label>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    removeSetVariable(id, key)
                                                }
                                                className="h-5 w-5 text-red-500 hover:text-red-700"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>

                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <div>
                                                <Label className="text-[10px] text-gray-500">
                                                    Identificador
                                                </Label>
                                                <Select
                                                    value={key}
                                                    onValueChange={(newKey) => {
                                                        // Evitar duplicados
                                                        const existing =
                                                            nodeData.setvariables ||
                                                            {}
                                                        if (existing[newKey])
                                                            return
                                                        const newVars = {
                                                            ...existing,
                                                        }
                                                        delete newVars[key]
                                                        newVars[newKey] = val
                                                        nodeData.setvariables =
                                                            newVars
                                                        triggerAfterSave(id)
                                                    }}
                                                >
                                                    <SelectTrigger className="h-8 border-amber-400 text-xs">
                                                        <SelectValue placeholder="Seleccionar..." />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {DIGITS.map((d) => (
                                                            <SelectItem
                                                                key={d}
                                                                value={d}
                                                                disabled={Object.keys(
                                                                    nodeData.setvariables ||
                                                                        {}
                                                                ).some(
                                                                    (k) =>
                                                                        k ===
                                                                            d &&
                                                                        k !==
                                                                            key
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
                                                    Valor
                                                </Label>
                                                <Input
                                                    value={decodeURIComponent(
                                                        val || ''
                                                    )}
                                                    onChange={(e) =>
                                                        updateSetVariable(
                                                            id,
                                                            key,
                                                            encodeURIComponent(
                                                                e.target.value
                                                            )
                                                        )
                                                    }
                                                    placeholder="Ej: CorreoCliente"
                                                    className="text-xs"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            )}

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={() => {
                                        triggerAfterSave(id)
                                        setAccordionValue(['connections'])
                                    }}
                                    className="bg-amber-600 text-white hover:bg-amber-700"
                                >
                                    💾 Guardar opciones y ver conexiones
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* 🔗 Conexiones dinámicas */}
                    <AccordionItem value="connections">
                        <AccordionTrigger className="rounded-md bg-amber-100/60 px-3 py-2 text-xs text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">
                            🔗 Conexiones de condiciones
                        </AccordionTrigger>
                        <AccordionContent className="mt-2">
                            <DynamicNodeConnectionsAccordion
                                nodeId={id}
                                variant="getdata"
                                options={Object.entries(
                                    nodeData.setvariables || {}
                                ).map(([key, val]) => ({
                                    id: key,
                                    label: decodeURIComponent(val || key),
                                    nextNodeId: nodeData.conditions?.[key],
                                }))}
                                onUpdateOption={(optionId, key, value) => {
                                    if (!nodeData.conditions)
                                        nodeData.conditions = {}
                                    if (value)
                                        nodeData.conditions[optionId] = value
                                    else delete nodeData.conditions[optionId]
                                    triggerAfterSave(id)
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    )
}
