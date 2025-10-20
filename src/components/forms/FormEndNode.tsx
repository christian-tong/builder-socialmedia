// src\components\forms\FormEndNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useFlowStore } from '@/store/useFlowStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

/**
 * 🟥 FormEndNode — Configuración del nodo final (Hangup)
 * --------------------------------------------------
 * - Muestra el nodo anterior con acordeón (como los menús)
 * - Permite editar la causa del colgado (hangupCause)
 * - Usa estilo coherente con FormMenuNodeSecundario
 */
export default function FormEndNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [prevNodes, setPrevNodes] = useState<string[]>([])

    // 🔁 Detectar nodos conectados anteriores
    useEffect(() => {
        const { prev } = getConnectedNodes(id)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
    }, [edges, nodes, id, getConnectedNodes])

    // 📋 Render acordeón del nodo anterior (mismo estilo sky/secondary)
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
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-rose-600 dark:text-rose-300">
                    Configuración del Nodo Final (Hangup)
                </Label>
                <Badge
                    variant="outline"
                    className="border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodo anterior con acordeón */}
            <div className="flex flex-col gap-3">
                {renderNodeList(
                    'Nodo anterior',
                    prevNodes,
                    'text-rose-700 dark:text-rose-300'
                )}
            </div>

            {/* ☎️ Causa del colgado */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Causa del colgado</Label>
                <Input
                    value={data.hangupCause || ''}
                    onChange={(e) =>
                        updateNodeData(id, { hangupCause: e.target.value })
                    }
                    placeholder="Ejemplo: Usuario colgó, timeout, etc."
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>
        </div>
    )
}
