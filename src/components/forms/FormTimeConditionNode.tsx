// src\components\forms\FormTimeConditionNode.tsx
'use client'

import React, { useEffect } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

const DAYS = [
    { value: 'mon', label: 'Lunes' },
    { value: 'tue', label: 'Martes' },
    { value: 'wed', label: 'Miércoles' },
    { value: 'thu', label: 'Jueves' },
    { value: 'fri', label: 'Viernes' },
    { value: 'sat', label: 'Sábado' },
    { value: 'sun', label: 'Domingo' },
]

/**
 * 🕒 FormTimeConditionNode (v3.0 – con descripción estandarizada)
 * ---------------------------------------------------------------
 * - Añade campo descripción reutilizable
 * - Usa colores y acordeones consistentes
 */
export default function FormTimeConditionNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.id)
    const falseConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onFalse'))
        .map((n) => n.id)

    useEffect(() => {
        if (data.dayStart && data.dayEnd && data.startTime && data.endTime) {
            const condition = `${data.dayStart}-${data.dayEnd},${data.startTime}-${data.endTime}`
            updateNodeData(id, { condition })
        }
    }, [
        data.dayStart,
        data.dayEnd,
        data.startTime,
        data.endTime,
        id,
        updateNodeData,
    ])

    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        updateNodeData(id, { description: e.target.value })
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-sky-600 dark:text-sky-300">
                    Condición de Tiempo
                </Label>
                <Badge
                    variant="outline"
                    className="border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Conexiones */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* ⚡ trueStep */}
            <NodeSelectionAccordion
                title="Seleccionar nodo trueStep"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                handleId="onTrue"
                accentColor="text-green-700 dark:text-green-300"
            />

            {/* ⚡ falseStep */}
            <NodeSelectionAccordion
                title="Seleccionar nodo falseStep"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                handleId="onFalse"
                accentColor="text-rose-700 dark:text-rose-300"
            />

            {/* ⚙️ Rango de días */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                {/* 📝 Descripción (al final) */}
                <div className="flex flex-col gap-1 border-t pt-3 dark:border-gray-800">
                    <Label
                        htmlFor={`description-${id}`}
                        className="text-muted-foreground text-xs"
                    >
                        Descripción
                    </Label>
                    <Input
                        id={`description-${id}`}
                        placeholder="Breve descripción del paso..."
                        value={data.description || ''}
                        onChange={handleDescriptionChange}
                        className="text-sm"
                    />
                </div>
                <Label className="text-sm font-medium">Rango de días</Label>
                <div className="flex items-center gap-2">
                    <Select
                        value={data.dayStart || ''}
                        onValueChange={(val) =>
                            updateNodeData(id, { dayStart: val })
                        }
                    >
                        <SelectTrigger className="w-full dark:bg-gray-900/50">
                            <SelectValue placeholder="Día inicio" />
                        </SelectTrigger>
                        <SelectContent>
                            {DAYS.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <span className="text-xs text-gray-500">a</span>

                    <Select
                        value={data.dayEnd || ''}
                        onValueChange={(val) =>
                            updateNodeData(id, { dayEnd: val })
                        }
                    >
                        <SelectTrigger className="w-full dark:bg-gray-900/50">
                            <SelectValue placeholder="Día fin" />
                        </SelectTrigger>
                        <SelectContent>
                            {DAYS.map((d) => (
                                <SelectItem key={d.value} value={d.value}>
                                    {d.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 🕓 Horario */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Horario (24h)</Label>
                <div className="flex items-center justify-between gap-2">
                    <Input
                        type="time"
                        value={data.startTime || ''}
                        onChange={(e) =>
                            updateNodeData(id, { startTime: e.target.value })
                        }
                        className="mt-1 text-sm dark:bg-gray-900/50"
                    />
                    <Input
                        type="time"
                        value={data.endTime || ''}
                        onChange={(e) =>
                            updateNodeData(id, { endTime: e.target.value })
                        }
                        className="mt-1 text-sm dark:bg-gray-900/50"
                    />
                </div>
            </div>
        </div>
    )
}
