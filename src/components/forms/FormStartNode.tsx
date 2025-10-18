// src\components\forms\FormStartNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useFlowStore } from '@/store/useFlowStore'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

/**
 * 🟢 FormStartNode
 * --------------------------------------------------
 * - Nodo inicial del flujo
 * - Permite editar título y descripción
 * - Muestra nodo siguiente (normalmente uno solo)
 */
export default function FormStartNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [nextLabel, setNextLabel] = useState<string>('—')

    // 🔁 Observa los edges para actualizar las conexiones
    useEffect(() => {
        const { next } = getConnectedNodes(id)

        setNextLabel(
            next.length
                ? next.map((n) => n.data?.label || n.id).join(', ')
                : '—'
        )
    }, [edges, nodes, id, getConnectedNodes])

    return (
        <div className="flex flex-col gap-4">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Nodo de Inicio</Label>
                <Badge
                    variant="outline"
                    className="border-green-300 bg-green-50 px-2 py-0.5 text-[10px] text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
                >
                    {id}
                </Badge>
            </div>

            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Nodo siguiente</Label>
                <Input
                    value={nextLabel}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
            </div>

            {/* 🧾 Campos editables */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Título</Label>
                <Input
                    value={data.label || ''}
                    onChange={(e) =>
                        updateNodeData(id, { label: e.target.value })
                    }
                    placeholder="Título del nodo inicial"
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>

            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Descripción</Label>
                <Input
                    value={data.message || ''}
                    onChange={(e) =>
                        updateNodeData(id, { message: e.target.value })
                    }
                    placeholder="Mensaje inicial del flujo"
                    className="text-sm dark:bg-gray-900/50"
                />
            </div>
        </div>
    )
}
