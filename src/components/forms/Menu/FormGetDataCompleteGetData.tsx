// src/components/forms/Menu/FormGetDataCompleteGetData.tsx

'use client'

import React, { useEffect } from 'react'
import { Label, Input, Textarea, Switch } from '@/components/ui'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { NodeFlowConnectionsManager } from '@/components/shared/NodeFlowConnectionsManager'
import type { GetDataCompleteObject } from '@/types/getDataComplete'

/**
 * 🧾 FormGetDataCompleteGetData (v1.0)
 * ------------------------------------------------------------
 * - Variante GETDATA del sistema GetDataComplete
 * - Campos base: condition, setvar, variable, alias, iterations, timeout
 * - Incluye prompt (para consultas o mensajes dinámicos)
 * - Sincronización diferida → guarda al triggerAfterSave
 */
export function FormGetDataCompleteGetData({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { availableNodes } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    const interactive = nodeData.interactive
    if (!interactive || interactive.type !== 'GETDATA') return null

    /* -------------------------------------------------------------------------- */
    /* 🧠 Helpers                                                                 */
    /* -------------------------------------------------------------------------- */
    const handleFieldChange = (
        field: keyof GetDataCompleteObject,
        val: string
    ) => {
        setNodeData(id, { [field]: encodeURIComponent(val) } as any)
        triggerAfterSave(id)
    }

    const handleToggleSaveHidden = (checked: boolean) => {
        setNodeData(id, { saveHidden: checked })
        triggerAfterSave(id)
    }

    const handlePromptChange = (val: string) => {
        const updated = {
            ...interactive,
            prompt: encodeURIComponent(val),
        }
        setNodeData(id, { interactive: updated })
        triggerAfterSave(id)
    }

    /* -------------------------------------------------------------------------- */
    /* 🧱 Campos base comunes                                                     */
    /* -------------------------------------------------------------------------- */
    const baseFields = [
        { key: 'condition', label: '🧩 Condition', placeholder: '[1-3]' },
        { key: 'setvar', label: '🏷️ SetVar', placeholder: 'RESULTADO' },
        { key: 'variable', label: '🔡 Variable', placeholder: 'DatoObtenido' },
        { key: 'alias', label: '🪪 Alias', placeholder: 'Alias descriptivo' },
        { key: 'iterations', label: '🔁 Iterations', placeholder: '1' },
        { key: 'timeOut', label: '⏱️ Timeout (ms)', placeholder: '60000' },
    ] as const

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
                                        f.key as any,
                                        e.target.value
                                    )
                                }
                                placeholder={f.placeholder}
                                className="text-xs"
                            />
                        </div>
                    ))}
                </div>
            </section>

            {/* 💬 PROMPT PRINCIPAL */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Prompt de consulta o mensaje dinámico
                </Label>
                <Textarea
                    value={decodeURIComponent(interactive.prompt || '')}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    placeholder="Ej: Consultando base de datos o variable..."
                    rows={4}
                    className="font-mono text-xs"
                />
            </section>

            {/* 🔗 CONEXIONES onTrue / onFalse */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    🔗 Conexiones de flujo
                </Label>
                <NodeFlowConnectionsManager
                    id={id}
                    data={nodeData}
                    availableNodes={availableNodes}
                    updateNodeData={(id, d) => setNodeData(id, d)}
                    connections={['onTrue', 'onFalse']}
                    accentColor="text-amber-600"
                    deferred
                />
            </section>
        </div>
    )
}
