// src/components/forms/Menu/FormGetDataCompleteSimpleText.tsx

'use client'

import React, { useCallback } from 'react'
import { Label, Input, Textarea, Switch, Button } from '@/components/ui'
import { Plus, Trash2 } from 'lucide-react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useGetDataCompleteSimpleTextStore } from '@/store/GetDataComplete/useGetDataCompleteSimpleTextStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { OptionFlowManager } from '@/components/shared/OptionFlowManager'
import type { GetDataCompleteObject } from '@/types/getDataComplete'

/**
 * 🟢 FormGetDataCompleteSimpleText (v3.1 — Full Sync + Auto Edge + Tipado)
 * ------------------------------------------------------------------------
 * ✅ prompt + description
 * ✅ setvariables + conditions con edge automático
 * ✅ Sincronización diferida v1.1
 * ✅ Tipado completo con keyof GetDataCompleteObject
 */
export function FormGetDataCompleteSimpleText({ id }: { id: string }) {
    const { getNodeData, triggerAfterSave } = useGetDataCompleteBaseStore()
    const {
        updatePrompt,
        updateDescription,
        updateField,
        toggleSaveHidden,
        addSetVariable,
        updateSetVariable,
        removeSetVariable,
        updateConditionLink,
    } = useGetDataCompleteSimpleTextStore()
    const { availableNodes, createConnectionIfMissing } = useNodeConnections(id)

    const nodeData = getNodeData(id) as GetDataCompleteObject

    /* ------------------------------ Handlers ---------------------------------- */
    const handleFieldChange = useCallback(
        (field: keyof GetDataCompleteObject, val: string) => {
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

    const handleSelectConditionLink = useCallback(
        (key: string, targetId: string) => {
            updateConditionLink(id, key, targetId)
            if (targetId) createConnectionIfMissing(targetId, key)
            triggerAfterSave(id)
        },
        [id, updateConditionLink, createConnectionIfMissing, triggerAfterSave]
    )

    /* ------------------------------- Render ----------------------------------- */

    // Campos base tipados
    const BASE_FIELDS: {
        key: keyof GetDataCompleteObject
        label: string
        placeholder: string
    }[] = [
        { key: 'condition', label: '🧩 Condition', placeholder: '[1-3]' },
        { key: 'setvar', label: '🏷️ SetVar', placeholder: 'RESULTADO' },
        { key: 'variable', label: '🔡 Variable', placeholder: 'MensajeSimple' },
        { key: 'alias', label: '🪪 Alias', placeholder: 'Alias descriptivo' },
        { key: 'iterations', label: '🔁 Iterations', placeholder: '1' },
        { key: 'timeOut', label: '⏱️ Timeout (ms)', placeholder: '60000' },
    ]

    return (
        <div className="mt-6 space-y-6">
            {/* ⚙️ CONFIGURACIÓN BASE */}
            <section className="space-y-3">
                <Label className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    ⚙️ Configuración base
                </Label>

                {/* SaveHidden */}
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
                    {BASE_FIELDS.map((f) => (
                        <div key={f.key}>
                            <Label className="text-xs text-gray-500">
                                {f.label}
                            </Label>
                            <Input
                                value={decodeURIComponent(
                                    nodeData[f.key]?.toString() ?? ''
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

            {/* 💬 PROMPT */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Mensaje principal (prompt)
                </Label>
                <Textarea
                    value={decodeURIComponent(nodeData.prompt ?? '')}
                    onChange={(e) => {
                        updatePrompt(id, e.target.value)
                        triggerAfterSave(id)
                    }}
                    placeholder="Texto del mensaje..."
                    rows={4}
                    className="font-mono text-xs"
                />
            </section>

            {/* 📝 DESCRIPTION */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    📝 Descripción
                </Label>
                <Textarea
                    value={decodeURIComponent(nodeData.description ?? '')}
                    onChange={(e) => {
                        updateDescription(id, e.target.value)
                        triggerAfterSave(id)
                    }}
                    placeholder="Descripción del nodo..."
                    rows={3}
                    className="font-mono text-xs"
                />
            </section>

            {/* 🧩 OPCIONES (SetVariables + Conditions) */}
            <section className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        🧩 Opciones de selección (setvariables)
                    </Label>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addSetVariable(id)}
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    >
                        <Plus className="mr-1 h-4 w-4" /> Añadir opción
                    </Button>
                </div>

                <div className="space-y-3">
                    {Object.entries(nodeData.setvariables ?? {}).map(
                        ([key, val], idx) => (
                            <div
                                key={key}
                                className="rounded-md border border-gray-200 p-3 dark:border-gray-700"
                            >
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs text-gray-500">
                                        Opción {idx + 1}
                                    </Label>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                            removeSetVariable(id, key)
                                        }
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                {/* Key / Value */}
                                <div className="mt-2 grid grid-cols-2 gap-2">
                                    <div>
                                        <Label className="text-xs text-gray-500">
                                            Clave
                                        </Label>
                                        <Input
                                            value={key}
                                            disabled
                                            className="bg-gray-100 text-xs dark:bg-gray-800"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs text-gray-500">
                                            Valor
                                        </Label>
                                        <Input
                                            value={decodeURIComponent(
                                                val ?? ''
                                            )}
                                            onChange={(e) =>
                                                updateSetVariable(
                                                    id,
                                                    key,
                                                    e.target.value
                                                )
                                            }
                                            placeholder="Ej: REGRESAR"
                                            className="text-xs"
                                        />
                                    </div>
                                </div>

                                {/* 🔗 Conexión automática */}
                                <div className="mt-3">
                                    <OptionFlowManager
                                        id={id}
                                        optionKey={key}
                                        selectedId={nodeData.conditions?.[key]}
                                        onSelect={(targetId) =>
                                            handleSelectConditionLink(
                                                key,
                                                targetId
                                            )
                                        }
                                        availableNodes={availableNodes}
                                        accentColor="text-emerald-600"
                                        deferred
                                    />
                                </div>
                            </div>
                        )
                    )}
                </div>
            </section>
        </div>
    )
}
