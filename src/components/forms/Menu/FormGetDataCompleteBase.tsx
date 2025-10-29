// src/components/forms/Menu/FormGetDataCompleteBase.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { Input, Label } from '@/components/ui'
import { NodeConnectionsAccordion } from '@/components/shared/NodeConnectionsAccordion'
import { NodeFlowConnectionsManager } from '@/components/shared/NodeFlowConnectionsManager'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import type { GetDataCompleteObject } from '@/types/getDataComplete'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { Switch } from '@/components/ui/switch'

export default function FormGetDataCompleteBase({ id, data }: any) {
    const { registerSaveCallback, unregisterSaveCallback, updateNodeData } =
        useNodeConfigStore()
    const { initNode, getNodeData, setNodeData } = useGetDataCompleteBaseStore()
    const { prevNodes, availableNodes } = useNodeConnections(id)

    const [localData, setLocalData] = useState<Partial<GetDataCompleteObject>>(
        {}
    )

    // 🧩 Inicializar nodo en store local
    useEffect(() => {
        initNode(id)
        setLocalData(getNodeData(id))
    }, [id])

    // 💾 Sincronización diferida (v1.2)
    useEffect(() => {
        registerSaveCallback(id, () => {
            setNodeData(id, localData)
            updateNodeData(id, { ...data, object: localData })
        })
        return () => unregisterSaveCallback(id)
    }, [id, localData, setNodeData, updateNodeData])

    const handleChange = (field: keyof GetDataCompleteObject, value: any) =>
        setLocalData((prev) => ({ ...prev, [field]: value }))

    return (
        <div className="flex flex-col gap-6">
            {/* 🔗 Conexiones previas */}
            <NodeConnectionsAccordion
                title="Nodo anterior"
                nodesList={prevNodes}
                accentColor="text-purple-600"
            />

            {/* ⚙️ Control de flujo (onTrue / onFalse / onError) */}
            <NodeFlowConnectionsManager
                id={id}
                data={data}
                availableNodes={availableNodes}
                updateNodeData={updateNodeData}
                connections={['onTrue', 'onFalse', 'onError']}
                accentColor="text-purple-600"
                deferred={true} // mantiene el patrón de guardado diferido
            />

            {/* ⚙️ Configuración General */}
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
                    value={localData.timeOut || ''}
                    onChange={(e) => handleChange('timeOut', e.target.value)}
                    type="number"
                />

                <div className="flex items-center justify-between py-1">
                    <Label className="text-sm font-medium text-gray-700">
                        Guardar oculto
                    </Label>
                    <Switch
                        checked={localData.saveHidden ?? true}
                        onCheckedChange={(checked) =>
                            handleChange('saveHidden', checked)
                        }
                        className={`transition-colors duration-200 ease-in-out data-[state=checked]:bg-[#198754] data-[state=checked]:hover:bg-[#157347] data-[state=unchecked]:bg-gray-300`}
                    ></Switch>
                </div>
            </div>
        </div>
    )
}
