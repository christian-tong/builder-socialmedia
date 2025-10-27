// src\components\forms\FormVariablesNode.tsx

'use client'

import React, { useState, useEffect } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    useVariablesStore,
    type VariableEntry,
} from '@/store/useVariablesStore'

export default function FormVariablesNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData, registerSaveCallback, unregisterSaveCallback } =
        useNodeConfigStore()
    const { getNodeVariables, setNodeVariables } = useVariablesStore()
    const { nextNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const [localVars, setLocalVars] = useState<VariableEntry[]>([])

    useEffect(() => {
        setLocalVars(getNodeVariables(id))
    }, [id, getNodeVariables])

    const addVariable = () => {
        const newVar: VariableEntry = {
            key: `campo_${Date.now()}`,
            value: '',
        }
        setLocalVars((prev) => [...prev, newVar])
    }

    const removeVariable = (index: number) => {
        setLocalVars((prev) => prev.filter((_, i) => i !== index))
    }

    const updateValue = (index: number, value: string) => {
        setLocalVars((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], value }
            return updated
        })
    }

    useEffect(() => {
        registerSaveCallback(id, () => {
            setNodeVariables(id, localVars)
            const obj = Object.fromEntries(
                localVars.map((v) => [v.key, v.value.toUpperCase()])
            )
            updateNodeData(id, {
                object: { setvars: JSON.stringify(obj) },
            })
        })

        // Limpieza específica de este formulario
        return () => unregisterSaveCallback(id)
    }, [
        id,
        localVars,
        registerSaveCallback,
        unregisterSaveCallback,
        setNodeVariables,
        updateNodeData,
    ])

    return (
        <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label
                    className="text-sm font-semibold"
                    style={{ color: '#44344F' }}
                >
                    Nodo de Variables
                </Label>
                <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-[10px]"
                    style={{
                        color: '#44344F',
                        borderColor: '#44344F',
                        backgroundColor: 'rgba(68,52,79,0.08)',
                    }}
                >
                    {id}
                </Badge>
            </div>

            <NodeConnectionsAccordion
                title="Nodo siguiente"
                nodesList={nextNodes}
                accentColor="text-[#44344F]"
            />

            <NodeSelectionAccordion
                title="Conectar o desconectar nodos"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                accentColor="text-[#44344F]"
            />

            <div className="mt-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        Variables ({localVars.length})
                    </Label>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={addVariable}
                        style={{ borderColor: '#6A517B', color: '#fff' }}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar
                    </Button>
                </div>

                {localVars.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        No hay variables definidas.
                    </p>
                )}

                {localVars.map((v, i) => (
                    <div
                        key={v.key ?? i}
                        className="flex items-center gap-2 border-b pb-1 dark:border-gray-800"
                    >
                        <Input
                            value={v.value}
                            onChange={(e) => updateValue(i, e.target.value)}
                            placeholder="Valor descriptivo"
                            className="text-xs"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeVariable(i)}
                            className="text-red-500 hover:text-red-600"
                            aria-label="Eliminar variable"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
