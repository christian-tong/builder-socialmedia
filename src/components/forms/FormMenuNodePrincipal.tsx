// src\components\forms\FormMenuNodePrincipal.tsx

'use client'

import React, { useEffect, useRef, useState } from 'react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { Plus, Trash2, ChevronDown, Settings2 } from 'lucide-react'

/**
 * 🧾 FormMenuNodePrincipal
 * --------------------------------------------------
 * - Permite agregar / quitar opciones (mínimo 1)
 * - Muestra nodos anteriores y siguientes como listas expandibles
 * - Campo "Mensaje inicial" ahora es Textarea con auto-resize
 */
export default function FormMenuNodePrincipal({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [connections, setConnections] = useState<Record<number, string>>({})
    const [flowRefs, setFlowRefs] = useState<{
        onTrue?: string
        onFalse?: string
        onError?: string
    }>({})
    const [prevNodes, setPrevNodes] = useState<string[]>([])
    const [nextNodes, setNextNodes] = useState<string[]>([])

    const messageRef = useRef<HTMLTextAreaElement | null>(null)
    const options = data.options || []

    // 🔁 Detectar nodos anterior y siguiente
    useEffect(() => {
        const { prev, next } = getConnectedNodes(id)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
        setNextNodes(next.map((n) => n.data?.label || n.id))
    }, [edges, nodes, id, getConnectedNodes])

    // 🔄 Detectar nodos conectados por cada opción
    useEffect(() => {
        const conns: Record<number, string> = {}
        const refs: any = { onTrue: '—', onFalse: '—', onError: '—' }

        edges.forEach((edge) => {
            if (
                edge.source === id &&
                edge.sourceHandle?.startsWith('option-')
            ) {
                const index = parseInt(edge.sourceHandle.split('-')[1], 10)
                const targetNode = nodes.find((n) => n.id === edge.target)
                conns[index] = targetNode?.data?.label || targetNode?.id || '—'
            }

            // Flujos de control
            if (edge.source === id && edge.sourceHandle) {
                const target = nodes.find((n) => n.id === edge.target)
                if (edge.sourceHandle === 'onTrue')
                    refs.onTrue = target?.data?.label || target?.id || '—'
                if (edge.sourceHandle === 'onFalse')
                    refs.onFalse = target?.data?.label || target?.id || '—'
                if (edge.sourceHandle === 'onError')
                    refs.onError = target?.data?.label || target?.id || '—'
            }
        })
        setConnections(conns)
        setFlowRefs(refs)
    }, [edges, nodes, id, options.length])

    // 🧠 Auto-ajuste de altura
    const autoResize = () => {
        const el = messageRef.current
        if (!el) return
        el.style.height = 'auto'
        el.style.height = Math.min(el.scrollHeight, 400) + 'px'
    }

    useEffect(() => {
        autoResize()
    }, [data.message])

    // ➕ Agregar nueva opción
    const handleAddOption = () => {
        const newOptions = [
            ...options,
            { postbackText: String(options.length + 1), title: '', next: '' },
        ]
        updateNodeData(id, { options: newOptions })
    }

    // 🗑️ Eliminar opción
    const handleRemoveOption = (index: number) => {
        if (options.length <= 1) return
        const newOptions = options.filter((_: any, i: number) => i !== index)
        updateNodeData(id, { options: newOptions })
    }

    // ✏️ Actualizar opción
    const handleUpdateOption = (
        index: number,
        field: string,
        value: string
    ) => {
        const newOptions = options.map((opt: any, i: number) =>
            i === index ? { ...opt, [field]: value } : opt
        )
        updateNodeData(id, { options: newOptions })
    }

    // 📋 Función para renderizar lista resumida + expandible
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
                <Label className="text-sm font-semibold text-violet-600 dark:text-violet-300">
                    Configuración del Menú Principal
                </Label>
                <Badge
                    variant="outline"
                    className="border-violet-300 bg-violet-50 px-2 py-0.5 text-[10px] text-violet-800 dark:border-violet-700 dark:bg-violet-900/40 dark:text-violet-200"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Listado de nodos conectados con acordeón */}
            <div className="flex flex-col gap-3">
                {renderNodeList(
                    'Nodo anterior',
                    prevNodes,
                    'text-violet-700 dark:text-violet-300'
                )}
                {renderNodeList(
                    'Nodo siguiente',
                    nextNodes,
                    'text-violet-700 dark:text-violet-300'
                )}
            </div>

            {/* 🧠 Variable */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Variable</Label>
                <Input
                    value={data.variable || ''}
                    placeholder="Ejemplo: PRIMER_NIVEL"
                    onChange={(e) =>
                        updateNodeData(id, { variable: e.target.value })
                    }
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 📨 Mensaje inicial (Textarea con auto-resize) */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Mensaje inicial</Label>
                <Textarea
                    ref={messageRef}
                    value={data.message || ''}
                    placeholder="Texto que verá el usuario..."
                    onChange={(e) => {
                        updateNodeData(id, { message: e.target.value })
                        autoResize()
                    }}
                    className="min-h-[80px] text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* ⚙️ Configuración avanzada */}
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="config">
                    <AccordionTrigger className="flex items-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium dark:bg-gray-800">
                        <Settings2 className="h-4 w-4" />
                        Control de flujo (onTrue / onFalse / onError)
                    </AccordionTrigger>
                    <AccordionContent className="mt-2 space-y-4 rounded-md bg-gray-50 p-3 dark:bg-gray-900/40">
                        {/* 🟢 onTrue */}
                        <div className="rounded-md border border-green-200 bg-green-50/40 p-3 dark:border-green-900 dark:bg-green-950/30">
                            <Label className="mb-1 text-xs font-semibold text-green-700 dark:text-green-400">
                                🟢 onTrue (válido)
                            </Label>
                            <Input
                                readOnly
                                value={flowRefs.onTrue || '—'}
                                placeholder="Nodo siguiente al validar correctamente"
                                className="font-mono text-xs dark:bg-gray-900/50"
                            />
                            <p className="text-[10px] text-gray-500 italic dark:text-gray-400">
                                Nodo siguiente si la condición se cumple (flujo
                                exitoso).
                            </p>
                        </div>

                        {/* 🟡 onFalse */}
                        <div className="rounded-md border border-amber-200 bg-amber-50/40 p-3 dark:border-amber-900 dark:bg-amber-950/30">
                            <Label className="mb-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                                🟡 onFalse (inválido)
                            </Label>
                            <Input
                                readOnly
                                value={flowRefs.onFalse || '—'}
                                placeholder="Nodo siguiente si no coincide"
                                className="font-mono text-xs dark:bg-gray-900/50"
                            />
                            <p className="text-[10px] text-gray-500 italic dark:text-gray-400">
                                Nodo siguiente si la validación falla (flujo
                                alterno).
                            </p>
                        </div>

                        {/* 🔴 onError */}
                        <div className="rounded-md border border-red-200 bg-red-50/40 p-3 dark:border-red-900 dark:bg-red-950/30">
                            <Label className="mb-1 text-xs font-semibold text-red-700 dark:text-red-400">
                                🔴 onError (timeout / intentos)
                            </Label>
                            <Input
                                readOnly
                                value={flowRefs.onError || '—'}
                                placeholder="Nodo siguiente por error o timeout"
                                className="font-mono text-xs dark:bg-gray-900/50"
                            />
                            <p className="text-[10px] text-gray-500 italic dark:text-gray-400">
                                Nodo siguiente si ocurre un error o expira el
                                tiempo de espera.
                            </p>
                        </div>

                        {/* ⚙️ Extra config */}
                        <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                                <Label className="text-xs font-semibold">
                                    iterations
                                </Label>
                                <Input
                                    value={data.iterations || '2'}
                                    onChange={(e) =>
                                        updateNodeData(id, {
                                            iterations: e.target.value,
                                        })
                                    }
                                    className="text-xs dark:bg-gray-900/50"
                                />
                            </div>
                            <div>
                                <Label className="text-xs font-semibold">
                                    timeOut (ms)
                                </Label>
                                <Input
                                    value={data.timeOut || '90000'}
                                    onChange={(e) =>
                                        updateNodeData(id, {
                                            timeOut: e.target.value,
                                        })
                                    }
                                    className="text-xs dark:bg-gray-900/50"
                                />
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            {/* 🧩 Opciones */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-violet-700 dark:text-violet-300">
                        Opciones ({options.length})
                    </Label>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddOption}
                        className="bg-violet-500 px-3 py-1 text-xs text-white hover:bg-violet-600"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt: any, index: number) => (
                    <div
                        key={index}
                        className="relative flex flex-col gap-2 rounded-md border border-violet-200 bg-violet-50/40 p-3 dark:border-gray-700 dark:bg-gray-900/30"
                    >
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-violet-600 dark:text-violet-300">
                                Opción {index + 1}
                            </Label>
                            {options.length > 1 && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveOption(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* ✏️ Campos editables */}
                        <div className="flex gap-2">
                            <Input
                                value={opt.title}
                                onChange={(e) =>
                                    handleUpdateOption(
                                        index,
                                        'title',
                                        e.target.value
                                    )
                                }
                                placeholder="Título visible"
                                className="flex-1 text-sm dark:bg-gray-900/50"
                            />
                        </div>

                        {/* 🔗 Nodo siguiente (solo lectura) */}
                        <div className="mt-1 flex flex-col gap-1">
                            <Label className="text-xs font-medium text-gray-600 dark:text-gray-300">
                                Nodo siguiente
                            </Label>
                            <Input
                                value={connections[index] || '—'}
                                readOnly
                                className="bg-gray-100 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
