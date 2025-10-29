// src/components/forms/Menu/FormGetDataCompleteBase.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Input, Label } from '@/components/ui'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'
import { NodeFlowConnectionsManager } from '@/components/shared/NodeFlowConnectionsManager'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import {
    createEmptyInteractive,
    type GetDataCompleteObject,
} from '@/types/getDataComplete'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { FormGetDataCompleteQR } from './FormGetDataCompleteQR'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export default function FormGetDataCompleteBase({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData, onAfterSave } =
        useGetDataCompleteBaseStore()
    const { createConnectionIfMissing, prevNodes, availableNodes } =
        useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<GetDataCompleteObject>>(
        {}
    )

    useEffect(() => {
        initNode(id)
        setLocalData(getNodeData(id))
    }, [id])

    // 💾 Guardar cambios diferidos
    useEffect(() => {
        const saveFn = () => {
            const current = getNodeData(id)
            setNodeData(id, current)
            updateNodeData(id, { ...data, object: current })

            // 🧩 Post-save: crear edges de opciones (solo en QR)
            if (current.interactive?.type === 'quick_reply') {
                current.interactive.options.forEach((opt) => {
                    if (opt.nextNodeId) {
                        createConnectionIfMissing(
                            opt.nextNodeId,
                            opt.postbackText
                        )
                    }
                })
            }

            // 🔁 Ejecutar callback global si existe
            onAfterSave?.(id, current)
        }

        registerSaveCallback(id, saveFn)
        return () => unregisterSaveCallback(id)
    }, [
        id,
        registerSaveCallback,
        unregisterSaveCallback,
        setNodeData,
        updateNodeData,
    ])

    // ✏️ Edición local
    const handleChange = (field: keyof GetDataCompleteObject, value: any) => {
        setLocalData((prev) => {
            const updated = { ...prev, [field]: value }
            setNodeData(id, updated)
            return updated
        })
    }

    const handleInteractiveTypeChange = (value: 'quick_reply' | 'list') => {
        const interactive = createEmptyInteractive(value)
        handleChange('interactive', interactive)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* 🔗 Conexiones principales */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-purple-600"
            />

            <NodeFlowConnectionsManager
                id={id}
                data={data}
                availableNodes={availableNodes}
                updateNodeData={updateNodeData}
                connections={['onTrue', 'onFalse', 'onError']}
                accentColor="text-purple-600"
                deferred={true}
            />

            {/* ⚙️ Configuración general */}
            <div className="space-y-3">
                <Label>🧩 Variable</Label>
                <Input
                    value={localData.variable || ''}
                    onChange={(e) => handleChange('variable', e.target.value)}
                    placeholder="Ej: PrimeraOpcion"
                />

                <Label>🔠 Alias</Label>
                <Input
                    value={localData.alias || ''}
                    onChange={(e) => handleChange('alias', e.target.value)}
                    placeholder="Alias"
                />

                <Label>💾 SetVar</Label>
                <Input
                    value={localData.setvar || ''}
                    onChange={(e) => handleChange('setvar', e.target.value)}
                    placeholder="PRIMER_NIVEL"
                />

                <Label>⏳ Timeout (ms)</Label>
                <Input
                    type="number"
                    value={localData.timeOut || ''}
                    onChange={(e) => handleChange('timeOut', e.target.value)}
                />

                {/* Switch Guardar oculto */}
                <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium text-gray-700">
                        Guardar oculto
                    </Label>
                    <Switch
                        checked={localData.saveHidden ?? true}
                        onCheckedChange={(checked) =>
                            handleChange('saveHidden', checked)
                        }
                        className="transition-colors duration-200 ease-in-out data-[state=checked]:bg-[#198754] data-[state=unchecked]:bg-gray-300"
                    />
                </div>

                {/* 🔘 Selector de tipo interactivo */}
                <div className="pt-2">
                    <Label className="mb-1 block text-sm font-medium">
                        Tipo interactivo
                    </Label>
                    <Select
                        value={localData.interactive?.type || 'quick_reply'}
                        onValueChange={handleInteractiveTypeChange}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona tipo" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="quick_reply">
                                Quick Reply
                            </SelectItem>
                            <SelectItem value="list">List</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 🧱 Form dinámico */}
            {localData.interactive?.type === 'quick_reply' && (
                <FormGetDataCompleteQR id={id} />
            )}
            {localData.interactive?.type === 'list' && (
                <div className="p-3 text-sm text-gray-500 italic">
                    📋 Aquí irá el FormGetDataCompleteList (en construcción)
                </div>
            )}
        </div>
    )
}
