// src/components/forms/Menu/FormGetDataCompleteSimpleText.tsx

'use client'

import React from 'react'
import { Label, Input, Textarea, Switch } from '@/components/ui'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { NodeFlowConnectionsManager } from '@/components/shared/NodeFlowConnectionsManager'
import type {
    GetDataCompleteObject,
    SimpleTextInteractive,
} from '@/types/getDataComplete'

/**
 * 🟢 FormGetDataCompleteSimpleText (v1.2 — Type-safe)
 * ------------------------------------------------------------
 * - Corrige type narrowing de `interactive`
 * - Usa `SIMPLETEXT` en lugar de `simple_text`
 * - Cambia `message` → `prompt`
 * - Mantiene compatibilidad con sincronización diferida
 */
export function FormGetDataCompleteSimpleText({ id }: { id: string }) {
    const { getNodeData, setNodeData, triggerAfterSave } =
        useGetDataCompleteBaseStore()
    const { availableNodes } = useNodeConnections(id)

    const nodeData = getNodeData(id)
    const interactive = nodeData.interactive

    // ✅ Acepta solo nodos de tipo SIMPLETEXT
    if (!interactive || interactive.type !== 'SIMPLETEXT') return null
    const simpleText = interactive as SimpleTextInteractive

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
        const updated: SimpleTextInteractive = {
            ...simpleText,
            type: 'SIMPLETEXT',
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
        { key: 'variable', label: '🔡 Variable', placeholder: 'MensajeSimple' },
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

            {/* 💬 PROMPT SIMPLETEXT */}
            <section>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    💬 Mensaje principal (prompt)
                </Label>
                <Textarea
                    value={decodeURIComponent(simpleText.prompt || '')}
                    onChange={(e) => handlePromptChange(e.target.value)}
                    placeholder="Escribe el mensaje que se mostrará..."
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
                    accentColor="text-sky-600"
                    deferred
                />
            </section>
        </div>
    )
}
