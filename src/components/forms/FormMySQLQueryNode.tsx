// src\components\forms\FormMySQLQueryNode.tsx

'use client'

import React, { useEffect } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useMySQLQueryStore } from '@/store/useMySQLQueryStore'

/**
 * 🧾 FormMySQLQueryNode
 * ----------------------------------------------------
 * - Permite editar la consulta SQL, variable destino y script
 * - Totalmente sincronizado con Zustand
 */
export default function FormMySQLQueryNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { updateNodeData } = useNodeConfigStore()
    const { initNode, updateField, byId, resetNode } = useMySQLQueryStore()

    const {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        toggleConnection,
    } = useNodeConnections(id)

    // 🧠 Inicializa el estado si no existe
    useEffect(() => {
        initNode(id)
        return () => resetNode(id)
    }, [id, initNode, resetNode])

    const queryObj = byId[id] || {}

    const handleChange = (field: keyof typeof queryObj, value: string) => {
        updateField(id, field, value)
        updateNodeData(id, {
            object: { ...queryObj, [field]: value },
        })
    }

    return (
        <div className="flex flex-col gap-5">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label
                    className="text-sm font-semibold"
                    style={{ color: '#2D3E50' }}
                >
                    Nodo MySQL Query
                </Label>
                <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-[10px]"
                    style={{
                        borderColor: '#2D3E50',
                        color: '#2D3E50',
                        backgroundColor: 'rgba(45,62,80,0.08)',
                    }}
                >
                    {id}
                </Badge>
            </div>

            {/* 🔗 Conexiones */}
            <div className="flex flex-col gap-3">
                <NodeConnectionsAccordion
                    title="Nodo anterior"
                    nodesList={prevNodes}
                    accentColor="text-[#2D3E50]"
                />
                <NodeConnectionsAccordion
                    title="Nodo siguiente"
                    nodesList={nextNodes}
                    accentColor="text-[#2D3E50]"
                />
            </div>

            <NodeSelectionAccordion
                title="Conectar o desconectar nodos"
                availableNodes={availableNodes}
                hasConnection={hasConnection}
                toggleConnection={toggleConnection}
                accentColor="text-[#2D3E50]"
            />

            {/* ⚙️ Campos del query */}
            <div className="mt-4 flex flex-col gap-3">
                <div>
                    <Label className="text-sm font-medium">
                        Variable destino (setvar)
                    </Label>
                    <Input
                        value={queryObj.setvar || ''}
                        onChange={(e) => handleChange('setvar', e.target.value)}
                        placeholder="Ejemplo: ELECTRICIDAD_CONCESIONARIO_DEUDA"
                        className="text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium">Query SQL</Label>
                    <Textarea
                        rows={5}
                        value={queryObj.query || ''}
                        onChange={(e) => handleChange('query', e.target.value)}
                        placeholder="SELECT ... FROM ..."
                        className="font-mono text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium">Alias</Label>
                    <Input
                        value={queryObj.alias || ''}
                        onChange={(e) => handleChange('alias', e.target.value)}
                        placeholder="Alias descriptivo"
                        className="text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium">
                        Script (resultado)
                    </Label>
                    <Input
                        value={queryObj.script || ''}
                        onChange={(e) => handleChange('script', e.target.value)}
                        placeholder="${datos}"
                        className="text-xs"
                    />
                </div>
            </div>
        </div>
    )
}
