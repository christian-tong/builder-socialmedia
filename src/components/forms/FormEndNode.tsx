// src\components\forms\FormEndNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useFlowStore } from '@/store/useFlowStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🟥 FormEndNode — Configuración del nodo final (Hangup)
 * --------------------------------------------------
 * - Muestra los nodos conectados (anterior y siguiente)
 * - Permite editar la causa del colgado (hangupCause)
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

    const [prevLabel, setPrevLabel] = useState<string>('—')

    // 🔁 Actualizar lista de conexiones
    useEffect(() => {
        const { prev } = getConnectedNodes(id)
        setPrevLabel(
            prev.length > 0
                ? prev.map((n) => n.data?.label || n.id).join(', ')
                : '—'
        )
    }, [edges, nodes, id, getConnectedNodes])

    return (
        <div className="flex flex-col gap-4">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                    Nodo Final (Hangup)
                </Label>
                <Badge
                    variant="outline"
                    className="border-rose-300 bg-rose-50 px-2 py-0.5 text-[10px] text-rose-800 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodo anterior */}
            <div className="flex flex-col gap-2">
                <Label className="text-sm font-medium">Nodo anterior</Label>
                <Input
                    value={prevLabel}
                    readOnly
                    className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
                />
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
