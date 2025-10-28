// src\components\shared\NodeSelectAccordion.tsx

'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
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
import { usePendingConnectionsStore } from '@/store/usePendingConnectionsStore'
import { useFlowStore } from '@/store/useFlowStore'

interface NodeSelectAccordionProps {
    title: string
    availableNodes: any[]
    selectedId?: string
    onSelect: (id: string) => void
    onUnselect?: () => void
    accentColor?: string
    handleId?: string
    /** 🔁 Si true, NO toca edges en vivo; solo guarda draft para “Guardar cambios” */
    deferred?: boolean
    createConnection?: (targetId: string, handleId?: string) => void
    removeConnection?: (targetId: string, handleId?: string) => void
    /** Para saber el source actual (requerido en modo deferred) */
    sourceId?: string
}

export function NodeSelectAccordion({
    title,
    availableNodes,
    selectedId,
    onSelect,
    onUnselect,
    handleId,
    deferred = false,
    createConnection,
    removeConnection,
    sourceId,
    accentColor = 'text-gray-700 dark:text-gray-300',
}: NodeSelectAccordionProps) {
    const { setDraft } = usePendingConnectionsStore()
    const { edges, setEdges } = useFlowStore()

    // 🔐 Mantener un valor UI estable mientras hay jitter de props
    const [lastStableSelected, setLastStableSelected] = useState<string | ''>(
        selectedId || ''
    )
    useEffect(() => {
        // actualiza solo si realmente cambió a un valor distinto (evita oscilar a '')
        if (selectedId && selectedId !== lastStableSelected) {
            setLastStableSelected(selectedId)
        }
        // si se limpió explícitamente (usuario eligió "Ninguno"), respétalo
        if (selectedId === '') setLastStableSelected('')
    }, [selectedId, lastStableSelected])

    // 📦 Firma estable de disponibles para detectar cambios reales entre renders
    const availSignature = useMemo(
        () => JSON.stringify([...availableNodes.map((n) => n.id)].sort()),
        [availableNodes]
    )

    const lastAvailSigRef = useRef(availSignature)
    const debounceTimerRef = useRef<number | null>(null)
    const justInteractedRef = useRef<number>(0) // marca tiempo de selección manual

    // 🧹 Limpieza con debounce: evita falsos negativos cuando la lista se recompone
    useEffect(() => {
        // si no hay selección, no limpies nada (no hay qué validar)
        if (!selectedId) return

        const stillExists = availableNodes.some((n) => n.id === selectedId)
        const now = Date.now()

        // si el usuario acaba de seleccionar (200ms), no limpies
        if (now - justInteractedRef.current < 200) return

        // si existe, cancela cualquier limpieza pendiente
        if (stillExists) {
            if (debounceTimerRef.current) {
                window.clearTimeout(debounceTimerRef.current)
                debounceTimerRef.current = null
            }
            return
        }

        // si la firma de disponibles está cambiando todavía, espera
        const initialSig = availSignature
        if (debounceTimerRef.current) {
            window.clearTimeout(debounceTimerRef.current)
        }
        debounceTimerRef.current = window.setTimeout(() => {
            // revalida tras el delay
            const currentSig = JSON.stringify(
                [...availableNodes.map((n) => n.id)].sort()
            )
            const existsNow = availableNodes.some((n) => n.id === selectedId)

            // solo limpiar si:
            // 1) sigue sin existir
            // 2) la firma no cambió durante el debounce (lista estable)
            const listStable = initialSig === currentSig

            if (!existsNow && listStable) {
                // 🔻 limpiar selección y draft diferido
                onUnselect?.()
                onSelect('')
                if (deferred && sourceId) setDraft(sourceId, handleId, '')
                setLastStableSelected('') // refleja en la UI
                // además: elimina edge real si lo hubiera en diferido (paridad con "Ninguno")
                if (deferred && sourceId) {
                    const updatedEdges = edges.filter(
                        (e) =>
                            !(
                                e.source === sourceId &&
                                e.sourceHandle === handleId
                            )
                    )
                    if (updatedEdges.length !== edges.length)
                        setEdges(updatedEdges)
                }
            }
        }, 200) as unknown as number

        return () => {
            if (debounceTimerRef.current) {
                window.clearTimeout(debounceTimerRef.current)
                debounceTimerRef.current = null
            }
        }
    }, [
        selectedId,
        availableNodes,
        availSignature,
        deferred,
        sourceId,
        handleId,
        onSelect,
        onUnselect,
        setDraft,
        edges,
        setEdges,
    ])

    const selectedNodeLabel =
        availableNodes.find((n) => n.id === (selectedId || lastStableSelected))
            ?.data?.label ||
        (selectedId || lastStableSelected
            ? selectedId || lastStableSelected
            : '—')

    const uiValue = (selectedId ?? lastStableSelected) || '__none__'

    const handleSelect = (targetId: string) => {
        justInteractedRef.current = Date.now()

        // 🧹 “Ninguno”
        if (targetId === '__none__') {
            if (deferred) {
                if (sourceId) {
                    setDraft(sourceId, handleId, '')
                    // elimina edge en diferido si existe
                    const updatedEdges = edges.filter(
                        (e) =>
                            !(
                                e.source === sourceId &&
                                e.sourceHandle === handleId
                            )
                    )
                    if (updatedEdges.length !== edges.length)
                        setEdges(updatedEdges)
                }
                onUnselect?.()
                onSelect('')
                setLastStableSelected('') // refleja en UI al instante
                return
            }

            // modo inmediato
            if (removeConnection && selectedId)
                removeConnection(selectedId, handleId)
            onUnselect?.()
            onSelect('')
            setLastStableSelected('')
            return
        }

        // ✅ Selección válida
        if (deferred) {
            if (sourceId) setDraft(sourceId, handleId, targetId)
            setLastStableSelected(targetId) // evita parpadeo a 'Ninguno'
            onSelect(targetId)
            return
        }

        // modo inmediato
        if (removeConnection && selectedId && selectedId !== targetId) {
            removeConnection(selectedId, handleId)
        }
        if (createConnection && targetId) {
            createConnection(targetId, handleId)
        }
        setLastStableSelected(targetId)
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
                                value={uiValue}
                                onValueChange={handleSelect}
                            >
                                <SelectTrigger className="w-full text-xs dark:bg-gray-900/50">
                                    <SelectValue placeholder="Elegir nodo destino" />
                                </SelectTrigger>
                                <SelectContent>
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
