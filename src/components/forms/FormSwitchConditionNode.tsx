// src/components/forms/FormSwitchConditionNode.tsx

'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2 } from 'lucide-react'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from '@/components/ui/select'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    useSwitchConditionStore,
} from '@/store/useSwitchConditionStore'
import { DynamicNodeConnectionsAccordionSwitch } from '@/components/shared/DynamicNodeConnectionsAccordionSwitch'

/**
 * 🧩 FormSwitchConditionNode (v3.1 – SafeInit + RealTimeHandleSync)
 * ----------------------------------------------------------------
 * ✅ Inicializa con condiciones SI/NO (ya visibles en el nodo)
 * ✅ Patrón igual a GetDataComplete: editar → guardar → conectar
 * ✅ Evita advertencia React Flow #008 (handle inexistente)
 * ✅ Compatible con DynamicNodeConnectionsAccordionSwitch
 */
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

    const { availableNodes } = useNodeConnections(id)
    const [accordionValue, setAccordionValue] = useState<string[]>(['edit'])

    /* -------------------------------------------------------------------------- */
    /* 🧠 Inicialización segura                                                   */
    /* -------------------------------------------------------------------------- */
    useEffect(() => {
        initNode(id)
    }, [id, initNode])

    const cfg = byId[id]
    if (!cfg) return null

    // 🧱 Si el nodo aún no tiene valores, inicializa con SI / NO visibles
    useEffect(() => {
        if (!cfg.values || cfg.values.length === 0) {
            addValue(id, 'SI')
            addValue(id, 'NO')
        }
    }, [cfg.values, addValue, id])

    const BASE_OPTIONS = ['SI', 'NO']
    const canAddMore = cfg.values.length < BASE_OPTIONS.length

    const selectableOptions = useMemo(() => {
        const unique = Array.from(new Set([...BASE_OPTIONS, ...cfg.values]))
        return unique
    }, [cfg.values])

    /* -------------------------------------------------------------------------- */
    /* 🧱 Render principal                                                        */
    /* -------------------------------------------------------------------------- */
    return (
        <div className="space-y-6">
            {/* ⚙️ CONFIGURACIÓN BASE */}
            <section className="space-y-3">
                <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                    <Label className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                        ⚙️ Switch Condition
                    </Label>
                    <Badge
                        variant="outline"
                        className="border-fuchsia-300 bg-fuchsia-50 px-2 py-0.5 text-[10px] text-fuchsia-700 dark:border-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300"
                    >
                        {id}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                        <Label className="text-sm">Variable</Label>
                        <Input
                            value={cfg.variable}
                            onChange={(e) => setVariable(id, e.target.value)}
                            placeholder="Ej: ESTADO"
                        />
                    </div>
                    <div>
                        <Label className="text-sm">Alias</Label>
                        <Input
                            value={cfg.alias ?? ''}
                            onChange={(e) => setAlias(id, e.target.value)}
                            placeholder="Alias descriptivo"
                        />
                    </div>
                    <div>
                        <Label className="text-sm">Modo coincidencia</Label>
                        <Select
                            value={cfg.mode}
                            onValueChange={(v) => setMode(id, v as any)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Modo" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="strict">
                                    Estricto (=)
                                </SelectItem>
                                <SelectItem value="flex">
                                    Flexible (~)
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </section>

            {/* 🧩 OPCIONES Y CONEXIONES */}
            <section className="rounded-lg border border-fuchsia-300 bg-fuchsia-50/40 p-3 dark:border-fuchsia-700 dark:bg-fuchsia-900/10">
                <Label className="text-xs font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                    🧩 Condiciones del Switch
                </Label>

                <Accordion
                    type="multiple"
                    value={accordionValue}
                    onValueChange={(val) => setAccordionValue(val as string[])}
                    className="mt-2"
                >
                    {/* ✏️ Edición de opciones */}
                    <AccordionItem value="edit">
                        <AccordionTrigger className="rounded-md bg-fuchsia-100/70 px-3 py-2 text-xs text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200">
                            ✏️ Editar condiciones ({cfg.values.length})
                        </AccordionTrigger>
                        <AccordionContent className="mt-2 space-y-3">
                            <div className="flex justify-end">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addValue(id)}
                                    disabled={!canAddMore}
                                    className={`${
                                        canAddMore
                                            ? 'border-fuchsia-600 bg-fuchsia-600 text-white hover:bg-fuchsia-500'
                                            : 'cursor-not-allowed opacity-60'
                                    }`}
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Añadir valor
                                </Button>
                            </div>

                            {cfg.values.map((val, idx) => (
                                <div
                                    key={`${val}-${idx}`}
                                    className="rounded-md border border-fuchsia-200 bg-white/80 p-3 text-xs shadow-sm dark:border-fuchsia-700 dark:bg-gray-950"
                                >
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-500">
                                            Condición {idx + 1}
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeValue(id, idx)}
                                            className="h-5 w-5 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>

                                    <div className="mt-2">
                                        <Label className="text-[10px] text-gray-500">
                                            Valor condicional
                                        </Label>
                                        <Select
                                            value={val}
                                            onValueChange={(newVal) =>
                                                updateValue(id, idx, newVal)
                                            }
                                        >
                                            <SelectTrigger className="h-8 border-fuchsia-400 text-xs">
                                                <SelectValue placeholder="Selecciona valor..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {selectableOptions.map(
                                                    (opt) => (
                                                        <SelectItem
                                                            key={opt}
                                                            value={opt}
                                                            disabled={
                                                                cfg.values.includes(
                                                                    opt
                                                                ) && val !== opt
                                                            }
                                                        >
                                                            {opt}
                                                        </SelectItem>
                                                    )
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            ))}

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={() =>
                                        setAccordionValue(['connections'])
                                    }
                                    className="bg-fuchsia-600 text-white hover:bg-fuchsia-700"
                                >
                                    💾 Guardar y ver conexiones
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* 🔗 Conexiones dinámicas */}
                    <AccordionItem value="connections">
                        <AccordionTrigger className="rounded-md bg-fuchsia-100/60 px-3 py-2 text-xs text-fuchsia-800 dark:bg-fuchsia-900/30 dark:text-fuchsia-200">
                            🔗 Conexiones condicionales
                        </AccordionTrigger>
                        <AccordionContent className="mt-2">
                            <DynamicNodeConnectionsAccordionSwitch
                                nodeId={id}
                                options={cfg.values.map((v) => ({
                                    id: v,
                                    label: v,
                                    nextNodeId: cfg.connections[v],
                                }))}
                                onUpdateConnection={(val, targetId) => {
                                    if (targetId)
                                        setConnection(id, val, targetId)
                                    else removeConnection(id, val)
                                }}
                            />
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </section>
        </div>
    )
}
