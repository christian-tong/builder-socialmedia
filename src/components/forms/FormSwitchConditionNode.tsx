// src\components\forms\FormSwitchConditionNode.tsx

'use client'

import React from 'react'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
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
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'

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
        setConnection,
        removeConnection,
    } = useSwitchConditionStore()

    React.useEffect(() => {
        initNode(id)
    }, [id, initNode])

    const cfg = byId[id]
    const {
        prevNodes,
        nextNodes,
        availableNodes,
        createConnection,
        removeConnection: removeFlowConn,
    } = useNodeConnections(id)

    if (!cfg) return null

    // 🔸 Controla si SI o NO ya están usados
    const usedValues = cfg.values
    const canAddMore = usedValues.length < 2

    return (
        <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                    ⚙️ Switch Condition
                </Label>
                <Badge
                    variant="outline"
                    className="border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                    {id}
                </Badge>
            </div>

            {/* Conexiones existentes */}
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

            {/* Configuración base */}
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                    <Label className="text-sm">Variable</Label>
                    <Input
                        value={cfg.variable}
                        onChange={(e) => setVariable(id, e.target.value)}
                        placeholder="Ej: ESTADO"
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
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Botón agregar */}
            <div className="flex justify-end pt-2">
                <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addValue(id)}
                    disabled={!canAddMore}
                    className={`${
                        canAddMore
                            ? 'bg-green-500 text-white hover:bg-green-600'
                            : 'cursor-not-allowed opacity text-white'
                    }`}
                >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Agregar valor
                </Button>
            </div>

            {/* ⚙️ Valores / Condiciones */}
            <Accordion type="multiple" className="w-full">
                {cfg.values.map((v, i) => {
                    const handleId = getSwitchHandleId(id, v)
                    const selectedNext = cfg.connections?.[v] || ''
                    const isSI = v === 'SI'
                    const isNO = v === 'NO'
                    const options = ['SI', 'NO']

                    return (
                        <AccordionItem key={`val-${i}`} value={`val-${i}`}>
                            <AccordionTrigger className="bg-gray-100 px-3 py-2 text-sm dark:bg-gray-800">
                                <div className="flex w-full justify-between">
                                    <span className="font-medium text-violet-700 dark:text-violet-300">
                                        {v || `Valor ${i + 1}`}
                                    </span>
                                </div>
                            </AccordionTrigger>

                            <AccordionContent className="space-y-3 rounded-b-md bg-gray-50 p-3 dark:bg-gray-900/40">
                                {/* 🔹 Select entre SI/NO */}
                                <div className="flex flex-col gap-1.5">
                                    <Label className="text-sm">
                                        Valor condicional
                                    </Label>
                                    <Select
                                        value={v}
                                        onValueChange={(val) =>
                                            updateValue(id, i, val)
                                        }
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Selecciona" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {options.map((opt) => (
                                                <SelectItem
                                                    key={opt}
                                                    value={opt}
                                                    disabled={
                                                        usedValues.includes(
                                                            opt
                                                        ) && v !== opt
                                                    }
                                                >
                                                    {opt}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Nodo siguiente */}
                                <NodeSelectAccordion
                                    title={`Nodo siguiente para "${v || '—'}"`}
                                    availableNodes={availableNodes}
                                    selectedId={selectedNext}
                                    handleId={handleId}
                                    onSelect={(targetId: string) =>
                                        setConnection(id, v, targetId)
                                    }
                                    onUnselect={() => removeConnection(id, v)}
                                    createConnection={(targetId: string) =>
                                        createConnection(targetId, handleId)
                                    }
                                    removeConnection={(targetId: string) =>
                                        removeFlowConn(targetId, handleId)
                                    }
                                    accentColor="text-violet-700 dark:text-violet-300"
                                />

                                {/* Botón eliminar */}
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeValue(id, i)}
                                    className="text-red-500 hover:text-red-600"
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />{' '}
                                    Eliminar valor
                                </Button>
                            </AccordionContent>
                        </AccordionItem>
                    )
                })}
            </Accordion>
        </div>
    )
}
