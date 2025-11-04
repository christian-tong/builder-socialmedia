// src\components\forms\FormVariablesNode.tsx

// src/components/forms/FormVariablesNode.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    useVariablesStore,
    type VariableEntry,
} from '@/store/useVariablesStore'

/**
 * 🧩 FormVariablesNode (v2.0 – Estándar SaveRecord visual)
 * ------------------------------------------------------------
 * ✅ Encabezado institucional violeta oscuro (#44344F)
 * ✅ Estructura: Nodo anterior + OnTrue + Variables dinámicas
 * ✅ Consistente con el ecosistema Importador v5.3
 */
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
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const [localVars, setLocalVars] = useState<VariableEntry[]>([])

    // 🧩 Inicialización
    useEffect(() => {
        setLocalVars(getNodeVariables(id))
    }, [id, getNodeVariables])

    // ➕ Agregar variable
    const addVariable = () => {
        const newVar: VariableEntry = {
            key: `campo_${Date.now()}`,
            value: '',
        }
        setLocalVars((prev) => [...prev, newVar])
    }

    // ❌ Eliminar variable
    const removeVariable = (index: number) => {
        setLocalVars((prev) => prev.filter((_, i) => i !== index))
    }

    // ✏️ Actualizar valor
    const updateValue = (index: number, value: string) => {
        setLocalVars((prev) => {
            const updated = [...prev]
            updated[index] = { ...updated[index], value }
            return updated
        })
    }

    // 💾 Guardado sincronizado
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
        return () => unregisterSaveCallback(id)
    }, [
        id,
        localVars,
        registerSaveCallback,
        unregisterSaveCallback,
        setNodeVariables,
        updateNodeData,
    ])

    /** 🧠 Conexiones onTrue */
    const { hasConnection: check, availableNodes: nodes } =
        useNodeConnections(id)
    const trueConnections = nodes
        .filter((n) => check(n.id, 'onTrue'))
        .map((n) => n.id)

    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-[#44344F] dark:text-[#A48CB6]">
                    🧮 Configuración Variables
                </Label>
                <Badge
                    variant="outline"
                    className="border-[#44344F] px-2 py-0.5 text-[10px] text-[#44344F]"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodo anterior */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* 🟢 Sección OnTrue */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                    Conexión trueStep
                </Label>
                <NodeConnectionsAccordion
                    title="Nodos conectados (trueStep)"
                    nodesList={trueConnections}
                    accentColor="text-green-700 dark:text-green-300"
                />
                <NodeSelectionAccordion
                    title="Seleccionar nodo trueStep"
                    availableNodes={availableNodes}
                    hasConnection={hasConnection}
                    toggleConnection={toggleConnection}
                    handleId="onTrue"
                    accentColor="text-green-700 dark:text-green-300"
                />
            </div>

            {/* ⚙️ Variables */}
            <div className="flex flex-col gap-3 border-t pt-3 dark:border-gray-800">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-[#44344F] dark:text-[#A48CB6]">
                        Variables ({localVars.length})
                    </Label>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={addVariable}
                        className="border-[#6A517B] bg-[#6A517B] text-white hover:bg-[#5A406C]"
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
                            placeholder={`Valor de ${v.key}`}
                            className="border-[#44344F] text-xs focus-visible:ring-[#44344F]"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeVariable(i)}
                            className="text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    )
}
