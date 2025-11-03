// src\components\forms\FormEndNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFlowStore } from '@/store/useFlowStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'

/**
 * 🟥 FormEndNode (v2.1 – Estandarizado)
 * --------------------------------------------------
 * - Aplica estructura visual del Prompt Base v1.1
 * - Solo incluye conexión entrante (prev)
 * - Colores rojos coherentes con su tipo de nodo (fin de flujo)
 * - Conserva campo editable `hangupCause`
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

            {/* 🔗 Conexión entrante */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* ☎️ Causa del colgado */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
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
