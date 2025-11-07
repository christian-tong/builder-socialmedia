// src/components/forms/FormSwitchConditionNode.tsx

'use client'

import React, { useEffect, useRef, useState } from 'react'
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
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { DynamicNodeConnectionsAccordionSwitch } from '@/components/shared/DynamicNodeConnectionsAccordionSwitch'

/**
 * 🧩 FormSwitchConditionNode (v5.5 — Deferred Sync + Edge Integration)
 * -------------------------------------------------------------------
 * ✅ Escritura fluida sin re-renders
 * ✅ Sincronización solo al guardar
 * ✅ Crea edges dinámicos como el original (sin alterar v1.5)
 * ✅ Añade nuevas condiciones automáticamente con nombre incremental
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

    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const [accordionValue, setAccordionValue] = useState<string[]>(['edit'])
    const [hasSaved, setHasSaved] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // 🧠 Buffer local sin renders
    const localValuesRef = useRef<string[]>([])
    const forceRefresh = () => setRefreshKey((k) => k + 1)

    // 🧩 Inicializa nodo y copia datos iniciales
    useEffect(() => {
        initNode(id)
    }, [id, initNode])

    const cfg = byId[id]
    useEffect(() => {
        if (cfg?.values && cfg.values.length > 0) {
            localValuesRef.current = [...cfg.values]
            forceRefresh()
        }
    }, [cfg?.values])

    if (!cfg) return null

    // 🔍 Conexión de tipo onTrue (igual que original)
    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.id)

    /* -------------------------------------------------------------------------- */
    /* ✏️ Edición local de condiciones                                           */
    /* -------------------------------------------------------------------------- */
    const handleChangeValue = (index: number, value: string) => {
        localValuesRef.current[index] = value
    }

    const handleAddCondition = () => {
        const newLabel = `Condición ${localValuesRef.current.length + 1}`
        localValuesRef.current.push(newLabel)
        forceRefresh()
    }

    const handleRemoveCondition = (index: number) => {
        localValuesRef.current.splice(index, 1)
        forceRefresh()
    }

    /* -------------------------------------------------------------------------- */
    /* 💾 Guardar cambios y mostrar conexiones                                   */
    /* -------------------------------------------------------------------------- */
    const handleSaveAndViewConnections = () => {
        // Eliminar valores previos y reescribirlos
        cfg.values.forEach((_, i) => removeValue(id, i))
        localValuesRef.current.forEach((val, i) => {
            if (cfg.values[i]) updateValue(id, i, val)
            else addValue(id, val)
        })

        setHasSaved(true)
        setAccordionValue(['connections'])
    }

    /* -------------------------------------------------------------------------- */
    /* 🧱 Render                                                                 */
    /* -------------------------------------------------------------------------- */
    return (
        <div key={refreshKey} className="flex flex-col gap-5">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-violet-700 dark:text-violet-300">
                    Nodo Condicional (Switch)
                </Label>
                <Badge
                    variant="outline"
                    className="border-violet-400 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-700 dark:border-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔵 Nodo anterior */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* 🟢 Conexión onTrue */}
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

            {/* ⚙️ Configuración base */}
            <section className="space-y-3 border-t pt-3 dark:border-gray-800">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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

            {/* 🧩 Condiciones */}
            <section className="rounded-lg border border-violet-300 bg-violet-50/40 p-3 dark:border-violet-700 dark:bg-violet-900/10">
                <Label className="text-xs font-semibold text-violet-700 dark:text-violet-300">
                    🧩 Condiciones del Switch
                </Label>

                <Accordion
                    type="multiple"
                    value={accordionValue}
                    onValueChange={(val) => setAccordionValue(val as string[])}
                    className="mt-2"
                >
                    {/* ✏️ Edición */}
                    <AccordionItem value="edit">
                        <AccordionTrigger className="rounded-md bg-violet-100/70 px-3 py-2 text-xs text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                            ✏️ Editar condiciones (
                            {localValuesRef.current.length})
                        </AccordionTrigger>
                        <AccordionContent className="mt-2 space-y-3">
                            <div className="flex justify-end">
                                <Button
                                    variant="default"
                                    onClick={handleAddCondition}
                                    className="bg-violet-600 text-white hover:bg-violet-700"
                                >
                                    <Plus className="mr-1 h-4 w-4" /> Añadir
                                    condición
                                </Button>
                            </div>

                            {/* Lista editable sin re-render */}
                            {localValuesRef.current.map((val, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-md border border-violet-200 bg-violet-50/60 p-3 text-xs shadow-sm dark:border-violet-700 dark:bg-violet-900/20"
                                >
                                    <div className="flex items-center justify-between">
                                        <Label className="text-[10px] text-gray-500">
                                            Condición {idx + 1}
                                        </Label>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleRemoveCondition(idx)
                                            }
                                            className="h-5 w-5 text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                    <Input
                                        defaultValue={val}
                                        onChange={(e) =>
                                            handleChangeValue(
                                                idx,
                                                e.target.value
                                            )
                                        }
                                        placeholder={`Valor ${idx + 1}`}
                                        className="mt-2 border-violet-400 text-xs dark:text-violet-100"
                                    />
                                </div>
                            ))}

                            <div className="flex justify-end pt-2">
                                <Button
                                    onClick={handleSaveAndViewConnections}
                                    className="bg-violet-600 text-white hover:bg-violet-700"
                                >
                                    💾 Guardar y ver conexiones
                                </Button>
                            </div>
                        </AccordionContent>
                    </AccordionItem>

                    {/* 🔗 Conexiones dinámicas (idéntico al original) */}
                    <AccordionItem value="connections">
                        <AccordionTrigger className="rounded-md bg-violet-100/60 px-3 py-2 text-xs text-violet-800 dark:bg-violet-900/30 dark:text-violet-200">
                            🔗 Conexiones condicionales
                        </AccordionTrigger>
                        <AccordionContent className="mt-2">
                            <DynamicNodeConnectionsAccordionSwitch
                                nodeId={id}
                                key={hasSaved ? 'saved' : 'unsaved'}
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
