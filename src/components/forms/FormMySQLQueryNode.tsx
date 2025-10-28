// src/components/forms/FormMySQLQueryNode.tsx
'use client'

import React, { useEffect, useState } from 'react'
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
import {
    useMySQLQueryStore,
    type MySQLQueryObject,
} from '@/store/useMySQLQueryStore'

export default function FormMySQLQueryNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const {
        getNodeData,
        setNodeData,
        byId,
        initNode,
        // ❌ NO usamos resetNode en desmontaje
    } = useMySQLQueryStore()

    const {
        prevNodes,
        nextNodes,
        availableNodes,
        hasConnection,
        toggleConnection,
    } = useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<MySQLQueryObject>>({
        setvar: '',
        query: '',
        alias: '',
        script: '',
    })

    // 🧠 Inicialización + debug logs
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)

        setLocalData(current)
        return () => {
            // ❌ Antes limpiábamos aquí con resetNode(id)
            // 🚫 Ya no lo hacemos para mantener persistencia
        }
    }, [id])

    // 💾 Callback de guardado con logs detallados
    useEffect(() => {
        registerSaveCallback(id, () => {
            const current = getNodeData(id)
            const finalData: MySQLQueryObject = {
                ...current,
                ...localData,
                mode: current.mode ?? 'simpletext',
            }

            setNodeData(id, finalData)
            updateNodeData(id, { object: { ...finalData } })
        })

        return () => {
            unregisterSaveCallback(id)
        }
    }, [id, localData])

    // 🧠 Manejo local con log
    const handleChange = (field: keyof MySQLQueryObject, value: string) => {
        setLocalData((prev) => ({ ...prev, [field]: value }))
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
                        value={localData.setvar || ''}
                        onChange={(e) => handleChange('setvar', e.target.value)}
                        placeholder="ELECTRICIDAD_CONCESIONARIO_DEUDA"
                        className="text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium">Query SQL</Label>
                    <Textarea
                        rows={5}
                        value={localData.query || ''}
                        onChange={(e) => handleChange('query', e.target.value)}
                        placeholder="SELECT ... FROM ..."
                        className="font-mono text-xs"
                    />
                </div>

                <div>
                    <Label className="text-sm font-medium">Alias</Label>
                    <Input
                        value={localData.alias || ''}
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
                        value={localData.script || ''}
                        onChange={(e) => handleChange('script', e.target.value)}
                        placeholder="${datos}"
                        className="text-xs"
                    />
                </div>
            </div>
        </div>
    )
}
