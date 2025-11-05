// src/components/shared/DynamicNodeConnectionsAccordion.tsx

'use client'

import React, { useMemo, useCallback, useEffect, useRef } from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { PlugZap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from '@/components/ui/select'
import {
    Accordion,
    AccordionItem,
    AccordionTrigger,
    AccordionContent,
} from '@/components/ui/accordion'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useFlowStore } from '@/store/useFlowStore'

interface DynamicOption {
    id: string
    label: string
    nextNodeId?: string
}

interface DynamicNodeConnectionsAccordionProps {
    nodeId: string
    options: DynamicOption[]
    onUpdateOption: (
        optionId: string,
        key: 'nextNodeId',
        value: string | null
    ) => void
    variant?: 'list' | 'quick_reply' | 'getdata' | 'simpletext'
    maxOptions?: number
    debug?: boolean
}

/**
 * ⚡ DynamicNodeConnectionsAccordion (v1.5 — Full Reactive EdgeSync)
 * ------------------------------------------------------------------
 * ✅ Mantiene toda la lógica de v1.4
 * ✅ Detecta creación manual de edges → actualiza store automáticamente
 * ✅ Detecta eliminación manual de edges → limpia conexión (nextNodeId = 'none')
 * ✅ Un solo edge por handle (single-edge policy)
 * ✅ Sin loops infinitos (verificación por divergencia)
 */
export function DynamicNodeConnectionsAccordion({
    nodeId,
    options,
    onUpdateOption,
    variant = 'quick_reply',
    maxOptions = 10,
    debug = false,
}: DynamicNodeConnectionsAccordionProps) {
    const { availableNodes, createConnectionIfMissing } =
        useNodeConnections(nodeId)
    const { edges, setEdges, nodes } = useFlowStore()
    const mountedRef = useRef(false)

    /* 🧱 Opciones seguras */
    const safeOptions = useMemo(
        () => options.slice(0, maxOptions),
        [options, maxOptions]
    )

    /* 🪄 Genera un handle ID según la variante */
    const getHandleId = useCallback(
        (optionId: string) => {
            switch (variant) {
                case 'list':
                case 'quick_reply':
                    return `option_${optionId}`
                case 'getdata':
                case 'simpletext':
                    return `cond_${optionId}`
                default:
                    return `option_${optionId}`
            }
        },
        [variant]
    )

    /* 🧹 Limpieza de edges obsoletos (mantiene onTrue/onFalse/onError) */
    useEffect(() => {
        const validHandles = safeOptions.map((o) => getHandleId(o.id))
        const baseHandles = ['onTrue', 'onFalse', 'onError']

        if (mountedRef.current) {
            const newEdges = edges.filter(
                (e) =>
                    e.source !== nodeId ||
                    (e.source === nodeId &&
                        e.sourceHandle &&
                        (validHandles.includes(e.sourceHandle) ||
                            baseHandles.includes(e.sourceHandle)))
            )
            if (newEdges.length !== edges.length) setEdges(newEdges)
        }
        mountedRef.current = true
    }, [safeOptions, edges, nodeId, getHandleId, setEdges])

    /* 🔁 Sincronización bidireccional (creación y eliminación manual) */
    useEffect(() => {
        safeOptions.forEach((opt) => {
            const handleId = getHandleId(opt.id)
            const outgoingEdge = edges.find(
                (e) => e.source === nodeId && e.sourceHandle === handleId
            )

            // 1️⃣ Edge eliminado manualmente
            if (!outgoingEdge && opt.nextNodeId && opt.nextNodeId !== 'none') {
                debug &&
                    console.log(
                        `🧭 Edge eliminado (${handleId}) → limpiar conexión`
                    )
                onUpdateOption(opt.id, 'nextNodeId', null)
            }

            // 2️⃣ Edge creado manualmente
            if (
                outgoingEdge &&
                (!opt.nextNodeId || opt.nextNodeId === 'none')
            ) {
                const targetNode = nodes.find(
                    (n) => n.id === outgoingEdge.target
                )
                debug &&
                    console.log(
                        `✨ Edge manual detectado: ${nodeId}::${opt.id} → ${targetNode?.data?.label || outgoingEdge.target}`
                    )
                onUpdateOption(opt.id, 'nextNodeId', outgoingEdge.target)
            }
        })
    }, [edges, nodes, nodeId, safeOptions, onUpdateOption, getHandleId, debug])

    /* 🔗 Crear o eliminar conexión manual desde el selector */
    const handleSelectChange = useCallback(
        (optionId: string, targetId: string | null) => {
            const handleId = getHandleId(optionId)
            // 🔒 Un solo edge por handle
            setEdges((prev) =>
                prev.filter(
                    (e) => !(e.source === nodeId && e.sourceHandle === handleId)
                )
            )

            if (!targetId || targetId === 'none') {
                onUpdateOption(optionId, 'nextNodeId', null)
                return
            }

            createConnectionIfMissing(targetId, handleId)
            onUpdateOption(optionId, 'nextNodeId', targetId)
            debug &&
                console.log(
                    `✅ Conectado ${nodeId} → ${targetId} (${handleId})`
                )
        },
        [
            nodeId,
            createConnectionIfMissing,
            onUpdateOption,
            getHandleId,
            setEdges,
            debug,
        ]
    )

    /* 🎨 Render principal */
    return (
        <div className="mt-5 rounded-xl border border-purple-300 bg-purple-50/40 p-3 dark:border-purple-800 dark:bg-purple-900/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        🔗 Conexiones dinámicas
                    </Label>
                </div>
                <Badge
                    variant="outline"
                    className="text-[10px] text-gray-600 dark:text-gray-300"
                >
                    {safeOptions.length} opciones
                </Badge>
            </div>

            <Accordion type="single" collapsible className="mt-2 w-full">
                <AccordionItem value="options">
                    <AccordionTrigger className="flex justify-between rounded-md bg-purple-100/70 px-3 py-2 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-200">
                        Ver conexiones
                    </AccordionTrigger>

                    <AccordionContent className="mt-2 space-y-2">
                        {safeOptions.length === 0 && (
                            <div className="rounded-md border border-dashed border-purple-300 px-3 py-2 text-xs text-gray-500 dark:border-purple-700 dark:text-gray-400">
                                No hay opciones configuradas aún.
                            </div>
                        )}

                        {safeOptions.map((opt, idx) => (
                            <div
                                key={opt.id}
                                className="flex flex-col gap-1 rounded-md border border-purple-200 bg-white/70 px-3 py-2 text-xs shadow-sm dark:border-purple-800 dark:bg-gray-950"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant="outline"
                                            className="border-purple-300 bg-purple-100 text-[10px] text-purple-700 dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
                                        >
                                            Opción {idx + 1}
                                        </Badge>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">
                                            {opt.label || opt.id}
                                        </span>
                                    </div>

                                    {opt.nextNodeId &&
                                        opt.nextNodeId !== 'none' && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() =>
                                                    handleSelectChange(
                                                        opt.id,
                                                        null
                                                    )
                                                }
                                                className="h-6 w-6 text-gray-400 hover:text-red-500"
                                                title="Eliminar conexión"
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                </div>

                                <Select
                                    value={opt.nextNodeId || 'none'}
                                    onValueChange={(val) =>
                                        handleSelectChange(opt.id, val || null)
                                    }
                                >
                                    <SelectTrigger className="h-8 border-purple-300 text-xs dark:border-purple-700">
                                        <SelectValue placeholder="Seleccionar nodo siguiente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">
                                            Ninguno
                                        </SelectItem>
                                        {availableNodes.map((n) => (
                                            <SelectItem key={n.id} value={n.id}>
                                                {n.data?.label || n.id}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        ))}
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </div>
    )
}
