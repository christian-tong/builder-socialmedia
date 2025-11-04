// src\components\forms\FormSetCustomerIDNode.tsx
'use client'

import React, { useEffect, useState } from 'react'
import {
    NodeConnectionsAccordion,
    NodeSelectionAccordion,
} from '@/components/shared/NodeConnectionsAccordion'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Trash2 } from 'lucide-react'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    useSetCustomerIDStore,
    type SetCustomerIDObject,
} from '@/store/useSetCustomerIDStore'

interface KeyValue {
    id: string
    key: string
    value: string
}

/**
 * 🧠 FormSetCustomerIDNode (v1.7 — integrado con Zustand)
 * ------------------------------------------------------------
 * ✅ Sin loops de render
 * ✅ Guarda opciones en store + nodeData
 * ✅ Sincroniza automáticamente con el nodo visual
 */
export default function FormSetCustomerIDNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()

    const { prevNodes, availableNodes, hasConnection, toggleConnection } =
        useNodeConnections(id)

    const { initNode, getNodeData, setNodeData } = useSetCustomerIDStore()

    const [localData, setLocalData] = useState<Partial<SetCustomerIDObject>>({})
    const [pairs, setPairs] = useState<KeyValue[]>([])

    /* 🧩 Inicialización */
    useEffect(() => {
        initNode(id)
        const current = getNodeData(id)
        setLocalData(current)
        const existing = current.options || {}
        const formatted = Object.entries(existing).map(([key, value]) => ({
            id: crypto.randomUUID(),
            key,
            value: String(value),
        }))
        setPairs(
            formatted.length
                ? formatted
                : [{ id: crypto.randomUUID(), key: '', value: '' }]
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id])

    /* 💾 Guardado al presionar guardar global */
    useEffect(() => {
        registerSaveCallback(id, () => {
            const optionsObject = Object.fromEntries(
                pairs
                    .filter((p) => p.key.trim() !== '')
                    .map((p) => [p.key.trim(), p.value.trim()])
            )

            const merged: SetCustomerIDObject = {
                options: optionsObject,
            }

            // Guardar en Zustand y en el nodo ReactFlow
            setNodeData(id, merged)
            updateNodeData(id, { ...data, object: merged })
        })

        return () => unregisterSaveCallback(id)
    }, [
        id,
        pairs,
        data,
        setNodeData,
        updateNodeData,
        registerSaveCallback,
        unregisterSaveCallback,
    ])

    /* ✏️ Helpers */
    const addPair = () =>
        setPairs((p) => [...p, { id: crypto.randomUUID(), key: '', value: '' }])

    const removePair = (uid: string) =>
        setPairs((p) => p.filter((x) => x.id !== uid))

    const updatePair = (uid: string, field: keyof KeyValue, val: string) =>
        setPairs((p) =>
            p.map((x) => (x.id === uid ? { ...x, [field]: val } : x))
        )

    /* 🔗 Conexiones */
    const trueConnections = availableNodes
        .filter((n) => hasConnection(n.id, 'onTrue'))
        .map((n) => n.id)

    /* 🧱 Render principal */
    return (
        <div className="flex flex-col gap-5">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label
                    className="text-sm font-semibold"
                    style={{ color: '#2C5282' }}
                >
                    Nodo SetCustomerID
                </Label>
                <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-[10px]"
                    style={{
                        color: '#2C5282',
                        borderColor: '#2C5282',
                        backgroundColor: 'rgba(44,82,130,0.08)',
                    }}
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

            {/* ⚡ Sección OnTrue */}
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

            {/* 🧩 Opciones Key–Value */}
            <div className="flex flex-col gap-3 border-t pt-3 dark:border-gray-800">
                <Label className="text-sm font-medium text-[#2C5282]">
                    📦 Opciones (objeto)
                </Label>

                <div className="flex justify-between text-[11px] font-semibold text-[#2C5282] uppercase">
                    <span>KEY</span>
                    <span>VALUE</span>
                </div>

                {pairs.map((p) => (
                    <div
                        key={p.id}
                        className="flex items-center gap-2 border-b pb-1 dark:border-gray-800"
                    >
                        <Input
                            value={p.key}
                            onChange={(e) =>
                                updatePair(p.id, 'key', e.target.value)
                            }
                            placeholder="clave"
                            className="min-w-0 flex-1 border-[#2C5282] text-xs focus-visible:ring-[#2C5282]"
                        />
                        <Input
                            value={p.value}
                            onChange={(e) =>
                                updatePair(p.id, 'value', e.target.value)
                            }
                            placeholder="valor"
                            className="min-w-0 flex-1 border-[#2C5282] text-xs focus-visible:ring-[#2C5282]"
                        />
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removePair(p.id)}
                            className="text-red-500 hover:text-red-600"
                            aria-label="Eliminar par"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                ))}

                <Button
                    size="sm"
                    variant="outline"
                    onClick={addPair}
                    className="mt-1 border-[#2C5282] bg-[#2C5282] text-white hover:bg-[#234E7F]"
                >
                    <Plus className="mr-1 h-3.5 w-3.5" /> Agregar opción
                </Button>
            </div>
        </div>
    )
}
