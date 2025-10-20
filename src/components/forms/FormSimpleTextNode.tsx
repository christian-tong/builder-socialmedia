// src\components\forms\FormSimpleTextNode.tsx

'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

/**
 * 📝 FormSimpleTextNode
 * --------------------------------------------------
 * - El título no es editable
 * - Muestra ID y nodos conectados con acordeón
 * - Actualiza en tiempo real al cambiar edges
 */
export default function FormSimpleTextNode({ id, data }: any) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    // 🔁 Observa edges y actualiza conexiones
    useEffect(() => {
        const { prev, next } = getConnectedNodes(id)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, id, getConnectedNodes])

    // ⚙️ Ajuste dinámico del alto del textarea
    useEffect(() => {
        const textarea = textareaRef.current
        if (!textarea) return
        textarea.style.height = 'auto'
        const newHeight = Math.min(textarea.scrollHeight, 600)
        textarea.style.height = `${newHeight}px`
        textarea.style.overflowY =
            textarea.scrollHeight > 600 ? 'auto' : 'hidden'
    }, [data.message])

    // 📋 Renderiza acordeón reutilizable (mismo estilo que DerivateNode)
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
                <Label className="text-sm font-semibold text-indigo-600 dark:text-indigo-300">
                    Nodo de Texto Simple
                </Label>
                <Badge
                    variant="outline"
                    className="border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodos conectados con acordeón */}
            <div className="flex flex-col gap-3">
                {renderNodeList(
                    'Nodo anterior',
                    prevNodes,
                    'text-indigo-700 dark:text-indigo-300'
                )}
                {renderNodeList(
                    'Nodo siguiente',
                    nextNodes,
                    'text-indigo-700 dark:text-indigo-300'
                )}
            </div>

            {/* 💬 Campo de mensaje editable */}
            <div className="mt-2 flex flex-col gap-2">
                <Label className="text-sm font-medium">Mensaje</Label>
                <Textarea
                    ref={textareaRef}
                    value={data.message || ''}
                    onChange={(e) =>
                        updateNodeData(id, { message: e.target.value })
                    }
                    placeholder="Escribe el mensaje del nodo..."
                    className="max-h-[300px] min-h-[80px] overflow-y-auto text-sm transition-[height] duration-150 ease-in-out dark:bg-gray-900/50"
                />
            </div>
        </div>
    )
}
