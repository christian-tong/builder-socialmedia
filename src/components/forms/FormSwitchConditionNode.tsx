// src\components\forms\FormSwitchConditionNode.tsx

'use client'

import React from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    useSwitchConditionStore,
    getSwitchHandleId,
} from '@/store/useSwitchConditionStore'

export default function FormSwitchConditionNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const {
        byId,
        initNode,
        setVariable,
        setAlias,
        setMode,
        addValue,
        updateValue,
        removeValue,
        addSetVar,
        updateSetVar,
        removeSetVar,
    } = useSwitchConditionStore()

    React.useEffect(() => {
        initNode(id)
    }, [id, initNode])
    const cfg = byId[id]

    const {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        toggleConnection,
    } = useNodeConnections(id)

    if (!cfg) return null

    return (
        <div className="flex flex-col gap-5">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                    Condición por Variable
                </Label>
                <Badge
                    variant="outline"
                    className="border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                    {id}
                </Badge>
            </div>

            {/* Conexiones existentes */}
            <div className="flex flex-col gap-3">
                <NodeConnectionsAccordion
                    title="Nodo anterior"
                    nodesList={prevNodes}
                    accentColor="text-violet-700 dark:text-violet-300"
                />
                <NodeConnectionsAccordion
                    title="Nodo siguiente"
                    nodesList={nextNodes}
                    accentColor="text-violet-700 dark:text-violet-300"
                />
            </div>

            {/* Campos básicos */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Variable</Label>
                    <Input
                        value={cfg.variable}
                        onChange={(e) => setVariable(id, e.target.value)}
                        placeholder="Ej: DETRACTOR"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Alias (opcional)</Label>
                    <Input
                        value={cfg.alias ?? ''}
                        onChange={(e) => setAlias(id, e.target.value)}
                        placeholder="Alias visible"
                    />
                </div>
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Modo de coincidencia</Label>
                    <Select
                        value={cfg.mode}
                        onValueChange={(v) => setMode(id, v as any)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Modo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="strict">Estricto (=)</SelectItem>
                            <SelectItem value="flex">Flexible (~)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Valores/Condiciones */}
            <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        Valores / Condiciones
                    </Label>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addValue(id)}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar valor
                    </Button>
                </div>

                {cfg.values.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        No hay valores definidos.
                    </p>
                )}

                {cfg.values.map((v, i) => {
                    const handleId = getSwitchHandleId(id, v || String(i))
                    return (
                        <div
                            key={`${id}-val-${i}`}
                            className="flex items-center gap-2 border-b pb-2 dark:border-gray-800"
                        >
                            <Input
                                value={v}
                                onChange={(e) =>
                                    updateValue(id, i, e.target.value)
                                }
                                placeholder="Ej: SI, NO, ALTO, BAJO"
                                className="text-sm"
                            />
                            <code className="rounded bg-violet-100 px-2 py-1 text-[10px] text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                                {handleId}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => removeValue(id, i)}
                                className="text-red-500 hover:text-red-600"
                                aria-label="Eliminar valor"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    )
                })}
            </div>

            {/* Conectar/Desconectar (fallback onTrue y otros) */}
            <NodeSelectionAccordion
                title="Conectar o desconectar nodos (onTrue / genéricos)"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                accentColor="text-violet-700 dark:text-violet-300"
            />
            <p className="text-[11px] text-gray-500">
                Para cada <strong>valor</strong>, conecta desde su handle
                lateral al nodo destino.
            </p>

            {/* SetVariables opcional */}
            <div className="mt-2 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                        SetVariables (opcional)
                    </Label>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addSetVar(id)}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" /> Agregar par
                    </Button>
                </div>

                {cfg.setvariables.length === 0 && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        No hay pares.
                    </p>
                )}

                {cfg.setvariables.map((sv, i) => (
                    <div
                        key={`sv-${i}`}
                        className="grid grid-cols-5 items-center gap-2 border-b pb-2 dark:border-gray-800"
                    >
                        <Input
                            value={sv.key}
                            onChange={(e) =>
                                updateSetVar(id, i, { key: e.target.value })
                            }
                            placeholder="Clave (ej: 1)"
                            className="col-span-2 text-xs"
                        />
                        <Input
                            value={sv.value}
                            onChange={(e) =>
                                updateSetVar(id, i, { value: e.target.value })
                            }
                            placeholder="Valor (ej: SI)"
                            className="col-span-2 text-xs"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeSetVar(id, i)}
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
