// src\components\forms\FormMenuNodeSecundario.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'

/**
 * 🧾 FormMenuNodeSecundario
 * --------------------------------------------------
 * - Permite editar título, variable y mensaje.
 * - Muestra nodos anterior / siguiente.
 * - Lista las opciones y sus nodos destino.
 */
export default function FormMenuNodeSecundario({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [connections, setConnections] = useState<Record<number, string>>({})
    const [prevLabel, setPrevLabel] = useState<string>('—')
    const [nextLabel, setNextLabel] = useState<string>('—')

    const options = data.options || []

    // 🔁 Detectar nodos conectados anterior y siguiente
    useEffect(() => {
        const { prev, next } = getConnectedNodes(id)
        setPrevLabel(
            prev.length
                ? prev.map((n) => n.data?.label || n.id).join(', ')
                : '—'
        )
        setNextLabel(
            next.length
                ? next.map((n) => n.data?.label || n.id).join(', ')
                : '—'
        )
    }, [edges, nodes, id, getConnectedNodes])

    // 🔄 Actualizar conexiones de cada opción
    useEffect(() => {
        const conns: Record<number, string> = {}
        edges.forEach((edge) => {
            if (
                edge.source === id &&
                edge.sourceHandle?.startsWith('option-')
            ) {
                const index = parseInt(edge.sourceHandle.split('-')[1], 10)
                const targetNode = nodes.find((n) => n.id === edge.target)
                conns[index] = targetNode?.data?.label || targetNode?.id || '—'
            }
        })
        setConnections(conns)
    }, [edges, nodes, id, options.length])

    // ➕ Agregar opción
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

    // ✏️ Editar campo
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

    return (
        <div className="flex flex-col gap-5">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-sky-600 dark:text-sky-300">
                    Configuración del Menú Secundario
                </Label>
                <Badge
                    variant="outline"
                    className="border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/40 dark:text-sky-200"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodos conectados */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Nodo anterior</Label>
                <Input
                    value={prevLabel}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Nodo siguiente</Label>
                <Input
                    value={nextLabel}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
            </div>

            {/* 🔹 Variable */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Variable</Label>
                <Input
                    value={data.variable || ''}
                    placeholder="Ejemplo: SEGUNDO_NIVEL"
                    onChange={(e) =>
                        updateNodeData(id, { variable: e.target.value })
                    }
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 📨 Mensaje inicial */}
            <div className="flex flex-col gap-1">
                <Label className="text-sm font-medium">Mensaje inicial</Label>
                <Input
                    value={data.message || ''}
                    placeholder="Texto que verá el usuario..."
                    onChange={(e) =>
                        updateNodeData(id, { message: e.target.value })
                    }
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>

            {/* 🧩 Opciones */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-sky-700 dark:text-sky-300">
                        Opciones ({options.length})
                    </Label>
                    <Button
                        variant="default"
                        size="sm"
                        onClick={handleAddOption}
                        className="bg-sky-500 px-3 py-1 text-xs text-white hover:bg-sky-600"
                    >
                        <Plus className="mr-1 h-3 w-3" /> Agregar opción
                    </Button>
                </div>

                {options.map((opt: any, index: number) => (
                    <div
                        key={index}
                        className="relative flex flex-col gap-2 rounded-md border border-sky-100 bg-sky-50/40 p-3 dark:border-gray-700 dark:bg-gray-900/30"
                    >
                        <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold text-sky-600 dark:text-sky-300">
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
                            <Input
                                value={opt.postbackText}
                                onChange={(e) =>
                                    handleUpdateOption(
                                        index,
                                        'postbackText',
                                        e.target.value
                                    )
                                }
                                placeholder="Valor"
                                className="w-24 text-center text-sm dark:bg-gray-900/50"
                            />
                        </div>

                        {/* 🔗 Nodo siguiente por opción */}
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
