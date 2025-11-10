// src/components/forms/FormMySQLQueryNode.tsx
'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    useMySQLQueryStore,
    type MySQLQueryObject,
} from '@/store/useMySQLQueryStore'

/**
 * 🧠 FormMySQLQueryNode (v3.0 – Descripción después de onTrue)
 * -------------------------------------------------------------
 * ✅ Reubicación de la descripción debajo de la conexión onTrue
 * ✅ Estilo unificado gris-azulado (institucional)
 * ✅ Integrado con useMySQLQueryStore
 * ✅ Mismo layout estructurado del estándar Prompt Base v1.1
 */
export default function FormMySQLQueryNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { getNodeData, setNodeData, initNode } = useMySQLQueryStore()
    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<MySQLQueryObject>>({
        setvar: '',
        query: '',
        alias: '',
        script: '',
    })

    // 🧩 Inicialización
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)
    }, [id])

    // 💾 Guardado
    useEffect(() => {
        registerSaveCallback(id, () => {
            const current = getNodeData(id)
            const finalData: MySQLQueryObject = { ...current, ...localData }
            setNodeData(id, finalData)
            updateNodeData(id, { object: { ...finalData } })
        })
        return () => unregisterSaveCallback(id)
    }, [id, localData])

    const handleChange = (field: keyof MySQLQueryObject, value: string) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.id)

    return (
        <div className="flex flex-col gap-6">
            {/* 🏷️ Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label className="text-sm font-semibold text-[#2D3E50] dark:text-slate-300">
                    ⚙️ Configuración MySQL Query
                </Label>
                <Badge
                    variant="outline"
                    className="border-[#2D3E50] px-2 py-0.5 text-[10px] text-[#2D3E50]"
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

            {/* 🟢 Conexión onTrue */}
            <div className="flex flex-col gap-2 border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium text-green-600 dark:text-green-400">
                    Conexión trueStep
                </Label>
                <NodeConnectionsAccordion
                    title="Nodos conectados (trueStep)"
                    nodesList={trueConnections}
                    accentColor="text-green-700 dark:text-green-300"
                />
                <NodeSelectionAccordion
                    title="Seleccionar nodo trueStep"
                    availableNodes={availableNodes}
                    hasConnection={hasConnection}
                    toggleConnection={toggleConnection}
                    handleId="onTrue"
                    accentColor="text-green-700 dark:text-green-300"
                />
            </div>

            {/* 🧾 Descripción debajo de onTrue */}
            <div className="flex flex-col gap-1 border-t pt-3 dark:border-gray-800">
                <Label
                    htmlFor={`description-${id}`}
                    className="text-muted-foreground text-xs"
                >
                    Descripción
                </Label>
                <Input
                    id={`description-${id}`}
                    placeholder="Breve descripción del paso..."
                    value={data.description || ''}
                    onChange={(e) =>
                        updateNodeData(id, { description: e.target.value })
                    }
                    className="text-sm"
                />
            </div>

            {/* ⚙️ Configuración principal */}
            <div className="flex flex-col gap-3 border-t pt-3 dark:border-gray-800">
                <div>
                    <Label className="text-sm font-semibold text-[#2D3E50] dark:text-slate-300">
                        🧩 Variable destino (setvar)
                    </Label>
                    <Input
                        value={localData.setvar || ''}
                        onChange={(e) => handleChange('setvar', e.target.value)}
                        placeholder="ELECTRICIDAD_CONCESIONARIO_DEUDA"
                        className="border-[#2D3E50] text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-semibold text-[#2D3E50] dark:text-slate-300">
                        🧮 Query SQL
                    </Label>
                    <Textarea
                        rows={5}
                        value={localData.query || ''}
                        onChange={(e) => handleChange('query', e.target.value)}
                        placeholder="SELECT ... FROM ..."
                        className="font-mono text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-semibold text-[#2D3E50] dark:text-slate-300">
                        🏷️ Alias
                    </Label>
                    <Input
                        value={localData.alias || ''}
                        onChange={(e) => handleChange('alias', e.target.value)}
                        placeholder="Alias descriptivo"
                        className="border-[#2D3E50] text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-semibold text-[#2D3E50] dark:text-slate-300">
                        📝 Script (resultado)
                    </Label>
                    <Input
                        value={localData.script || ''}
                        onChange={(e) => handleChange('script', e.target.value)}
                        placeholder="${datos}"
                        className="border-[#2D3E50] text-xs"
                    />
                </div>
            </div>
        </div>
    )
}
