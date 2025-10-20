// src\components\shared\NodeSelectAccordion.tsx
'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '@/components/ui/select'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { ChevronDown } from 'lucide-react'

interface NodeSelectAccordionProps {
    title: string
    availableNodes: any[]
    selectedId?: string
    onSelect: (id: string) => void
    accentColor?: string
    /** 🆕 Nuevo: soporte de conexiones con handleId */
    handleId?: string
    createConnection?: (targetId: string, handleId?: string) => void
    removeConnection?: (targetId: string, handleId?: string) => void
}

/**
 * 🎯 NodeSelectAccordion
 * --------------------------------------------------
 * - Selector simple de un solo nodo destino
 * - Crea visualmente la conexión (edge) en ReactFlow
 * - Compatible con `handleId` (onTrue, onFalse, onError)
 */
export function NodeSelectAccordion({
    title,
    availableNodes,
    selectedId,
    onSelect,
    handleId,
    createConnection,
    removeConnection,
    accentColor = 'text-gray-700 dark:text-gray-300',
}: NodeSelectAccordionProps) {
    const selectedNode =
        availableNodes.find((n) => n.id === selectedId)?.data?.label ||
        selectedId ||
        '—'

    const handleSelect = (targetId: string) => {
        // 1️⃣ Actualiza la data del nodo
        onSelect(targetId)

        // 2️⃣ Crea visualmente la conexión con el handle correcto
        if (createConnection && targetId) {
            createConnection(targetId, handleId)
        }

        // 3️⃣ Elimina la conexión anterior si existía
        if (removeConnection && selectedId && selectedId !== targetId) {
            removeConnection(selectedId, handleId)
        }
    }

    return (
        <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="nodeSelect">
                <AccordionTrigger className="flex justify-between rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                    <span className={`${accentColor} font-medium`}>
                        {title}
                    </span>
                    <span className="font-mono text-[11px] opacity-80">
                        {selectedNode}
                    </span>
                </AccordionTrigger>

                <AccordionContent className="mt-1 rounded-md bg-gray-50 px-3 py-3 dark:bg-gray-900">
                    {availableNodes.length === 0 ? (
                        <p className="text-xs text-gray-500 italic">
                            No hay nodos disponibles
                        </p>
                    ) : (
                        <div className="flex flex-col gap-1">
                            <Label className="text-xs">
                                Seleccionar nodo destino
                            </Label>
                            <Select
                                value={selectedId || ''}
                                onValueChange={(val) => handleSelect(val)}
                            >
                                <SelectTrigger className="w-full text-xs dark:bg-gray-900/50">
                                    <SelectValue placeholder="Elegir nodo destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableNodes.map((node) => (
                                        <SelectItem
                                            key={node.id}
                                            value={node.id}
                                        >
                                            {node.data?.label || node.id}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    )
}
