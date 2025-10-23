// src\components\shared\NodeSelectAccordion.tsx

'use client'

import React, { useEffect } from 'react'
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
    onUnselect?: () => void
    accentColor?: string
    handleId?: string
    createConnection?: (targetId: string, handleId?: string) => void
    removeConnection?: (targetId: string, handleId?: string) => void
}

/**
 * 🎯 NodeSelectAccordion
 * --------------------------------------------------
 * - Compatible con `MenuNodeFormLayout` y `VariantOptionAccordion`
 * - Soporta deselección manual ("Ninguno") y limpieza automática
 *   cuando el nodo conectado desaparece del canvas.
 */
export function NodeSelectAccordion({
    title,
    availableNodes,
    selectedId,
    onSelect,
    onUnselect,
    handleId,
    createConnection,
    removeConnection,
    accentColor = 'text-gray-700 dark:text-gray-300',
}: NodeSelectAccordionProps) {
    // 🧠 Limpieza automática si el nodo ya no existe
    useEffect(() => {
        if (!selectedId) return
        const stillExists = availableNodes.some((n) => n.id === selectedId)
        if (!stillExists) {
            onUnselect?.()
            onSelect('')
        }
    }, [availableNodes, selectedId, onSelect, onUnselect])

    // 📋 Etiqueta visible
    const selectedNodeLabel =
        availableNodes.find((n) => n.id === selectedId)?.data?.label ||
        (selectedId ? selectedId : '—')

    // ⚙️ Selección de nodo
    const handleSelect = (targetId: string) => {
        // 🔹 Si selecciona “Ninguno”
        if (targetId === '__none__') {
            if (removeConnection && selectedId) {
                removeConnection(selectedId, handleId)
            }
            onUnselect?.()
            onSelect('')
            return
        }

        // 🔄 Si cambia de nodo
        if (removeConnection && selectedId && selectedId !== targetId) {
            removeConnection(selectedId, handleId)
        }

        if (createConnection && targetId) {
            createConnection(targetId, handleId)
        }

        onSelect(targetId)
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
                                value={selectedId || '__none__'}
                                onValueChange={handleSelect}
                            >
                                <SelectTrigger className="w-full text-xs dark:bg-gray-900/50">
                                    <SelectValue placeholder="Elegir nodo destino" />
                                </SelectTrigger>
                                <SelectContent>
                                    {/* ✅ Opción válida para limpiar selección */}
                                    <SelectItem value="__none__">
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
