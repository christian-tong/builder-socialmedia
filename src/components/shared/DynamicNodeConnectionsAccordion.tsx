// src/components/shared/DynamicNodeConnectionsAccordion.tsx

'use client'

import React, { useMemo, useCallback, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from '@/components/ui/select'
import { PlugZap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useFlowStore } from '@/store/useFlowStore' // ✅ Importar para manejar edges globales de ReactFlow

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
}

/**
 * 🎛️ DynamicNodeConnectionsAccordion (v1.3 — AutoEdgeSync Fix)
 * ------------------------------------------------------------------
 * ✅ Crea/Elimina edges sincronizados con ReactFlow global store
 * ✅ Limpia edges huérfanos al borrar opciones
 * ✅ Usa prefijo estable (option_* / cond_*)
 */
export function DynamicNodeConnectionsAccordion({
    nodeId,
    options,
    onUpdateOption,
    variant = 'quick_reply',
    maxOptions = 10,
}: DynamicNodeConnectionsAccordionProps) {
    const { availableNodes, createConnectionIfMissing } =
        useNodeConnections(nodeId)
    const { edges, setEdges } = useFlowStore() // ⚡ Acceso directo a edges globales

    const safeOptions = useMemo(
        () => options.slice(0, maxOptions),
        [options, maxOptions]
    )

    /** 🪄 Genera un handle ID estable según el tipo */
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

    /** 🧹 Limpia edges obsoletos cuando se borran opciones */
    useEffect(() => {
        const validHandles = safeOptions.map((o) => getHandleId(o.id))
        const newEdges = edges.filter(
            (e) =>
                e.source !== nodeId ||
                (e.source === nodeId &&
                    e.sourceHandle &&
                    validHandles.includes(e.sourceHandle))
        )
        if (newEdges.length !== edges.length) setEdges(newEdges)
    }, [safeOptions, edges, nodeId, getHandleId, setEdges])

    /** 🔗 Crear o eliminar conexión */
    const handleSelectChange = useCallback(
        (optionId: string, targetId: string | null) => {
            const handleId = getHandleId(optionId)

            if (targetId) {
                // ✅ Crear conexión si no existe
                createConnectionIfMissing(targetId, handleId)
                onUpdateOption(optionId, 'nextNodeId', targetId)
            } else {
                // 🧹 Eliminar todos los edges que usen ese handle
                setEdges((prev) =>
                    prev.filter(
                        (e) =>
                            !(
                                e.source === nodeId &&
                                e.sourceHandle === handleId
                            )
                    )
                )
                onUpdateOption(optionId, 'nextNodeId', null)
            }
        },
        [
            nodeId,
            createConnectionIfMissing,
            onUpdateOption,
            getHandleId,
            setEdges,
        ]
    )

    return (
        <div className="mt-5 rounded-xl border border-purple-300 bg-purple-50/40 p-3 dark:border-purple-800 dark:bg-purple-900/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                        🔗 Conexiones de opciones
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

                                    {opt.nextNodeId && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleSelectChange(opt.id, null)
                                            }
                                            className="h-6 w-6 text-gray-400 hover:text-red-500"
                                            title="Eliminar conexión"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </Button>
                                    )}
                                </div>

                                <Select
                                    value={opt.nextNodeId || ''}
                                    onValueChange={(val) =>
                                        handleSelectChange(opt.id, val || null)
                                    }
                                >
                                    <SelectTrigger className="h-8 border-purple-300 text-xs dark:border-purple-700">
                                        <SelectValue placeholder="Seleccionar nodo siguiente..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableNodes.length === 0 && (
                                            <SelectItem value="" disabled>
                                                No hay otros nodos
                                            </SelectItem>
                                        )}
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
