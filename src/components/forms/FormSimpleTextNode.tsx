// src\components\forms\FormSimpleTextNode.tsx

'use client'

import React, { useEffect, useRef } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 📝 FormSimpleTextNode (v2.1 – estructura estandarizada)
 * --------------------------------------------------
 * - Misma jerarquía visual que FormTimeConditionNode
 * - Mantiene consistencia cromática y separadores
 * - Usa solo una conexión condicional (onTrue)
 * - Textarea con autoajuste dinámico
 */
export default function FormSimpleTextNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()

    // 🧠 Hook centralizado de conexiones
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    // 🔍 Filtra conexiones salientes específicas
    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.id)

    // 🪶 Autoajuste del textarea
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    useEffect(() => {
        const el = textareaRef.current
        if (!el) return
        el.style.height = 'auto'
        const newHeight = Math.min(el.scrollHeight, 600)
        el.style.height = `${newHeight}px`
        el.style.overflowY = el.scrollHeight > 600 ? 'auto' : 'hidden'
    }, [data.message])

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

            {/* 🔗 Conexiones entrantes */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* ⚡ Sección onTrue */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                    Conexión OnTrue
                </Label>
                <NodeConnectionsAccordion
                    title="Nodos conectados (onTrue)"
                    nodesList={trueConnections}
                    accentColor="text-green-700 dark:text-green-300"
                />
                <NodeSelectionAccordion
                    title="Seleccionar nodo OnTrue"
                    availableNodes={availableNodes}
                    hasConnection={hasConnection}
                    toggleConnection={toggleConnection}
                    handleId="onTrue"
                    accentColor="text-green-700 dark:text-green-300"
                />
            </div>

            {/* 💬 Contenido del mensaje */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
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
