// src\components\forms\FormNoOpNode.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFlowStore } from '@/store/useFlowStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'

/**
 * 🟤 FormNoOpNode (v3.1 – Nodo anterior + Descripción estandarizada)
 * ------------------------------------------------------------------
 * ✅ Estructura Prompt Base v1.1
 * ✅ Se agrega sección "Nodo anterior"
 * ✅ Campo "Descripción" con layout uniforme
 * ✅ Colores grises consistentes con NoOpNode
 * ✅ Registro de callback vacío para coherencia
 */
export default function FormNoOpNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData, registerSaveCallback, unregisterSaveCallback } =
        useNodeConfigStore()
    const { getConnectedNodes, edges, nodes } = useFlowStore()

    const [prevNodes, setPrevNodes] = useState<string[]>([])

    // 🔁 Detectar nodos conectados anteriores
    useEffect(() => {
        const { prev } = getConnectedNodes(id)
        setPrevNodes(prev.map((n) => n.data?.label || n.id))
    }, [edges, nodes, id, getConnectedNodes])

    // 💾 Registrar callback vacío
    useEffect(() => {
        registerSaveCallback(id, () => {
            console.log(`🟤 [NoOpNode] Guardado noop para id: ${id}`)
        })
        return () => unregisterSaveCallback(id)
    }, [id, registerSaveCallback, unregisterSaveCallback])

    // ✏️ Actualizar descripción
    const handleDescriptionChange = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        updateNodeData(id, { description: e.target.value })
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label
                    className="text-sm font-semibold"
                    style={{ color: '#6B7280' }}
                >
                    Configuración del Nodo NoOp (sin operación)
                </Label>
                <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-[10px]"
                    style={{
                        borderColor: '#6B7280',
                        color: '#6B7280',
                        backgroundColor: 'rgba(107,114,128,0.08)',
                    }}
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Nodo anterior */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* 📝 Descripción */}
            <div className="flex flex-col gap-1 border-t pt-3 dark:border-gray-800">
                <Label
                    htmlFor={`description-${id}`}
                    className="text-muted-foreground text-xs"
                >
                    Descripción
                </Label>
                <Input
                    id={`description-${id}`}
                    placeholder="Breve descripción del nodo..."
                    value={data.description || ''}
                    onChange={handleDescriptionChange}
                    className="text-sm"
                />
            </div>
        </div>
    )
}
