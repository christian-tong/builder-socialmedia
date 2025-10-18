// src\components\forms\FormSimpleTextNode.tsx

'use client'

import React, { useRef, useEffect, useState } from 'react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

/**
 * 📝 FormSimpleTextNode
 * --------------------------------------------------
 * - El título no es editable
 * - Muestra ID y nodos conectados
 * - Actualiza en tiempo real al cambiar edges
 */
export default function FormSimpleTextNode({ id, data }: any) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const [prevLabel, setPrevLabel] = useState<string>('—')
    const [nextLabel, setNextLabel] = useState<string>('—')

    // 🔁 Observa edges y actualiza conexiones
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
    }, [edges, nodes, id])

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

    return (
        <div className="flex flex-col gap-4">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                    Nodo de Texto Simple
                </Label>
                <Badge
                    variant="outline"
                    className="border-indigo-300 bg-indigo-50 px-2 py-0.5 text-[10px] text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-600"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔸 Título solo lectura */}
            <Input
                value={data.label || ''}
                disabled
                className="bg-gray-100 font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300"
            />

            {/* 🔹 Nodos conectados */}
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

            {/* 🔹 Campo de mensaje editable */}
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
