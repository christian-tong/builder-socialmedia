// src\components\shared\NodeSelectAccordion.tsx
'use client'

import React from 'react'
import { ChevronDown } from 'lucide-react'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface NodeSelectAccordionProps {
    title: string
    availableNodes: any[]
    selectedId?: string
    onSelect: (id: string) => void
    /** 🆕 Nuevo: cuando el usuario borra / limpia la selección */
    onUnselect?: () => void
    accentColor?: string
    handleId?: string
    createConnection?: (targetId: string, handleId?: string) => void
    removeConnection?: (targetId: string, handleId?: string) => void
}

/**
 * 🎯 NodeSelectAccordion
 * --------------------------------------------------
 * - Selector visual de un solo nodo destino
 * - Crea o elimina conexiones (edges) en ReactFlow
 * - Compatible con handleId (onTrue / onFalse / option-0…)
 */
export function NodeSelectAccordion({
    title,
    availableNodes,
    selectedId,
    onSelect,
    onUnselect, // ✅ Nueva prop
    handleId,
    createConnection,
    removeConnection,
    accentColor = 'text-gray-700 dark:text-gray-300',
}: NodeSelectAccordionProps) {
    const selectedNodeLabel =
        availableNodes.find((n) => n.id === selectedId)?.data?.label ||
        selectedId ||
        '—'

    const handleSelect = (targetId: string) => {
        if (targetId === '__none__') {
            // 🧹 Si selecciona “Ninguno”, limpia conexión
            onUnselect?.()
            if (removeConnection && selectedId) {
                removeConnection(selectedId, handleId)
            }
            return
        }

        onSelect(targetId)

        if (createConnection && targetId) {
            createConnection(targetId, handleId)
        }

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
                        {selectedNodeLabel}
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
                                    <SelectItem key="none" value="__none__">
                                        — Ninguno —
                                    </SelectItem>
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
