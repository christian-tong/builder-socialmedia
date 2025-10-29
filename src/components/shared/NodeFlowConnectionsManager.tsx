// src/components/shared/NodeFlowConnectionsManager.tsx

'use client'

import React, { useMemo } from 'react'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { Settings2 } from 'lucide-react'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useFlowStore } from '@/store/useFlowStore'

interface NodeFlowConnectionsManagerProps {
    /** ID del nodo actual */
    id: string
    /** Datos actuales del nodo (para leer onTrue/onFalse/onError) */
    data: Record<string, any>
    /** Controlador para guardar los cambios */
    updateNodeData: (id: string, newData: Record<string, any>) => void
    /** Nodos disponibles para conectar */
    availableNodes: any[]
    /** Conexiones activas */
    connections?: ('onTrue' | 'onFalse' | 'onError')[]
    /** Color del acento */
    accentColor?: string
    /** Controla si las conexiones se crean en diferido o en tiempo real */
    deferred?: boolean
}

/**
 * ⚙️ NodeFlowConnectionsManager
 * --------------------------------------------------------
 * - Permite definir dinámicamente qué conexiones mostrar
 * - Soporta onTrue, onFalse y onError
 * - Gestiona edges optimizados en el guardado
 * - 100% compatible con React Flow y patrón diferido v1.2
 */
export function NodeFlowConnectionsManager({
    id,
    data,
    updateNodeData,
    availableNodes,
    connections = ['onTrue'],
    accentColor = 'text-indigo-600',
    deferred = true,
}: NodeFlowConnectionsManagerProps) {
    const { createConnectionIfMissing } = useNodeConnections(id)
    const { edges } = useFlowStore()

    // 🧭 Definición de mapa de posibles conexiones
    const connectionMap = useMemo(() => {
        const map = {
            onTrue: {
                label: '🟢 onTrue (éxito / siguiente)',
                color: 'text-green-600 dark:text-green-400',
            },
            onFalse: {
                label: '🔴 onFalse (condición no cumplida)',
                color: 'text-red-600 dark:text-red-400',
            },
            onError: {
                label: '🟠 onError (fallo o excepción)',
                color: 'text-orange-600 dark:text-orange-400',
            },
        } as const

        return connections.map((key) => map[key])
    }, [connections])

    // 🧠 Al guardar, crea los edges automáticamente si no existen
    const handleSelect = (key: string, targetId: string) => {
        updateNodeData(id, { [key]: targetId })

        // 🧩 Evita duplicados y mantiene edges sincronizados
        if (!deferred && targetId) {
            const alreadyExists = edges.some(
                (e) =>
                    e.source === id &&
                    e.sourceHandle === key &&
                    e.target === targetId
            )
            if (!alreadyExists) {
                createConnectionIfMissing(targetId, key)
            }
        }
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="flowConnections">
                <AccordionTrigger className="flex items-center gap-2 bg-gray-100 px-3 py-2 text-sm font-medium dark:bg-gray-800">
                    <Settings2 className="h-4 w-4" />
                    Control de flujo ({connections.join(' / ')})
                </AccordionTrigger>

                <AccordionContent className="mt-2 space-y-3 rounded-md bg-gray-50 p-3 dark:bg-gray-900/40">
                    {connectionMap.map(({ label, color }) => {
                        const key = label.includes('True')
                            ? 'onTrue'
                            : label.includes('False')
                              ? 'onFalse'
                              : 'onError'

                        return (
                            <NodeSelectAccordion
                                key={key}
                                title={label}
                                availableNodes={availableNodes}
                                selectedId={data[key]}
                                handleId={key}
                                sourceId={id}
                                deferred={deferred}
                                onSelect={(val: string) =>
                                    handleSelect(key, val)
                                }
                                onUnselect={() => handleSelect(key, '')}
                                accentColor={color || accentColor}
                            />
                        )
                    })}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
