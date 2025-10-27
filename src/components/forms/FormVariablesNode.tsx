// src\components\forms\FormVariablesNode.tsx

'use client'

import React, { useState } from 'react'
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
    const { updateNodeData } = useNodeConfigStore()
    const { getNodeVariables, setNodeVariables, addVariableToNode } =
        useVariablesStore()

    const { nextNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const [localVars, setLocalVars] = useState<VariableEntry[]>(
        getNodeVariables(id)
    )

    const syncSetvarsToNodeData = (vars: VariableEntry[]) => {
        const obj = Object.fromEntries(
            vars.map((v) => [v.key, (v.value ?? '').toUpperCase()])
        )
        updateNodeData(id, {
            object: {
                setvars: JSON.stringify(obj),
            },
        })
    }

    const addVariable = () => {
        const updated = addVariableToNode(id)
        setLocalVars(updated)
        syncSetvarsToNodeData(updated)
    }

    const removeVariable = (index: number) => {
        const updated = localVars.filter((_, i) => i !== index)
        setLocalVars(updated)
        setNodeVariables(id, updated)
        syncSetvarsToNodeData(updated)
    }

    const updateValue = (index: number, value: string) => {
        const updated = [...localVars]
        updated[index] = { ...updated[index], value }
        setLocalVars(updated)
        setNodeVariables(id, updated)
        syncSetvarsToNodeData(updated)
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 🔹 Encabezado */}
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

            {/* 🔗 Nodo siguiente */}
            <NodeConnectionsAccordion
                title="Nodo siguiente"
                nodesList={nextNodes}
                accentColor="text-[#44344F]"
            />

            {/* ⚡ Selección interactiva */}
            <NodeSelectionAccordion
                title="Conectar o desconectar nodos"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                accentColor="text-[#44344F]"
            />

            {/* 🧩 Variables */}
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
                        {/* Solo el VALUE editable */}
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
