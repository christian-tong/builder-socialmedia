// src/components/forms/FormMySQLQueryNode.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
 * 🧠 FormMySQLQueryNode (v2.0 – Estándar SaveRecord visual)
 * -----------------------------------------------------------
 * ✅ Unifica estilo con SaveRecord
 * ✅ Mantiene color institucional gris-azulado
 * ✅ Añade conexión OnTrue
 * ✅ Estructura modular con encabezado, conexión y cuerpo
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

    // 🧩 Inicialización del nodo
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)
    }, [id])

    // 💾 Guardado sincronizado
    useEffect(() => {
        registerSaveCallback(id, () => {
            const current = getNodeData(id)
            const finalData: MySQLQueryObject = {
                ...current,
                ...localData,
            }

            setNodeData(id, finalData)
            updateNodeData(id, { object: { ...finalData } })
        })

        return () => unregisterSaveCallback(id)
    }, [id, localData])

    // ✏️ Actualización local
    const handleChange = (field: keyof MySQLQueryObject, value: string) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    /** 🔍 Conexiones onTrue */
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

            {/* 🔗 Conexión entrante */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-sky-700 dark:text-sky-300"
            />

            {/* 🟢 Sección OnTrue */}
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
                        className="border-[#2D3E50] text-xs focus-visible:ring-[#2D3E50]"
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
                        className="font-mono text-xs focus-visible:ring-[#2D3E50]"
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
                        className="border-[#2D3E50] text-xs focus-visible:ring-[#2D3E50]"
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
                        className="border-[#2D3E50] text-xs focus-visible:ring-[#2D3E50]"
                    />
                </div>
            </div>
        </div>
    )
}
