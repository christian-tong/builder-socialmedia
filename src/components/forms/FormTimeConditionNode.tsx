// src\components\forms\FormTimeConditionNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

/**
 * 🕓 Días válidos ISO cortos: mon, tue, wed, thu, fri, sat, sun
 */
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
 * 🕓 FormTimeConditionNode
 * --------------------------------------------------
 * - Permite definir rango de días y horario (inicio-fin)
 * - Genera condición: mon-fri,09:00-19:00
 * - Usa acordeones para mostrar nodo anterior y siguiente
 */
export default function FormTimeConditionNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 🧩 Genera condición automáticamente
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

    // 🔁 Detectar nodos conectados
    useEffect(() => {
        const { prev, next } = getConnectedNodes(id)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, id, getConnectedNodes])

    // 📋 Render acordeón
    const renderNodeList = (
        title: string,
        nodesList: string[],
        accent: string
    ) => {
        const visible = nodesList.slice(0, 1)
        const hidden = nodesList.slice(1)

        return (
            <div className="flex flex-col gap-2">
                <Label className={`text-sm font-medium ${accent}`}>
                    {title}
                </Label>

                {nodesList.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">
                        Ninguno conectado
                    </p>
                ) : (
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="list">
                            <AccordionTrigger className="flex justify-between rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                                {visible[0]}
                                {hidden.length > 0 && (
                                    <span className="flex items-center gap-1 text-[10px] opacity-70">
                                        {`+${hidden.length} más`}{' '}
                                        <ChevronDown className="h-3 w-3" />
                                    </span>
                                )}
                            </AccordionTrigger>

                            {hidden.length > 0 && (
                                <AccordionContent className="mt-1 space-y-1 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-900">
                                    {hidden.map((n, i) => (
                                        <div
                                            key={i}
                                            className="rounded px-2 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
                                        >
                                            {n}
                                        </div>
                                    ))}
                                </AccordionContent>
                            )}
                        </AccordionItem>
                    </Accordion>
                )}
            </div>
        )
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

            {/* 🔗 Nodos conectados con acordeón */}
            <div className="flex flex-col gap-3">
                {renderNodeList(
                    'Nodo anterior',
                    prevNodes,
                    'text-sky-700 dark:text-sky-300'
                )}
                {renderNodeList(
                    'Nodo siguiente',
                    nextNodes,
                    'text-sky-700 dark:text-sky-300'
                )}
            </div>

            {/* 🔹 Rango de días */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Rango de días</Label>
                <div className="flex items-center gap-2">
                    {/* Día inicio */}
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

                    {/* Día fin */}
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

            {/* 🔹 Horario */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                    Horario (formato 24 h)
                </Label>
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                            Desde
                        </Label>
                        <Input
                            type="time"
                            value={data.startTime || ''}
                            onChange={(e) =>
                                updateNodeData(id, {
                                    startTime: e.target.value,
                                })
                            }
                            className="mt-1 text-sm dark:bg-gray-900/50"
                        />
                    </div>

                    <div className="flex-1">
                        <Label className="text-xs text-gray-500 dark:text-gray-400">
                            Hasta
                        </Label>
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

            {/* 🔹 Resultado */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">
                    Condición generada
                </Label>
                <Input
                    value={data.condition || ''}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
            </div>
        </div>
    )
}
