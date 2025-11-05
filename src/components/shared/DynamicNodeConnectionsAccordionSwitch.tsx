// src\components\shared\DynamicNodeConnectionsAccordionSwitch.tsx

'use client'

import React, { useEffect, useRef, useCallback, useMemo } from 'react'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectValue,
    SelectItem,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { PlugZap, X } from 'lucide-react'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useFlowStore } from '@/store/useFlowStore'
import { getSwitchHandleId } from '@/store/useSwitchConditionStore'

/**
 * ⚡ DynamicNodeConnectionsAccordionSwitch (v1.5 — Full Reactive EdgeSync)
 * ------------------------------------------------------------------
 * ✅ Mantiene toda la lógica de v1.4
 * ✅ Detecta creación manual de edges → actualiza store automáticamente
 * ✅ Detecta eliminación manual de edges → limpia conexión (nextNodeId = 'none')
 * ✅ Un solo edge por handle (single-edge policy)
 */
interface SwitchConnectionOption {
    id: string
    label: string
    nextNodeId?: string
}

interface Props {
    nodeId: string
    options: SwitchConnectionOption[]
    onUpdateConnection: (value: string, targetId: string | null) => void
    maxOptions?: number
    debug?: boolean
}

export function DynamicNodeConnectionsAccordionSwitch({
    nodeId,
    options,
    onUpdateConnection,
    maxOptions = 12,
    debug = false,
}: Props) {
    const { availableNodes, createConnectionIfMissing } =
        useNodeConnections(nodeId)
    const { edges, setEdges, nodes } = useFlowStore()
    const mountedRef = useRef(false)

    /* 🧱 Opciones seguras */
    const safeOptions = useMemo(
        () => options.slice(0, maxOptions),
        [options, maxOptions]
    )

    /* 🧹 Limpieza automática de edges obsoletos */
    useEffect(() => {
        const validHandles = safeOptions.map((opt) =>
            getSwitchHandleId(nodeId, String(opt.id).trim())
        )
        const baseHandles = ['onTrue', 'onFalse', 'onError']

        if (mountedRef.current) {
            const filtered = edges.filter(
                (e) =>
                    e.source !== nodeId ||
                    (e.source === nodeId &&
                        e.sourceHandle &&
                        (validHandles.includes(e.sourceHandle) ||
                            baseHandles.includes(e.sourceHandle)))
            )
            if (filtered.length !== edges.length) {
                setEdges(filtered)
                debug && console.log('🧹 Limpieza de edges obsoletos')
            }
        }
        mountedRef.current = true
    }, [edges, nodeId, safeOptions, setEdges, debug])

    /* 🔁 Sincronización diferida (crea edges en render inicial) */
    useEffect(() => {
        const timeout = setTimeout(() => {
            safeOptions.forEach((opt) => {
                const handleId = getSwitchHandleId(
                    nodeId,
                    String(opt.id).trim()
                )
                const handleExists = document.querySelector(
                    `[data-id="${nodeId}"] [id="${CSS.escape(handleId)}"]`
                )
                if (!handleExists) return
                if (opt.nextNodeId) {
                    setEdges((prev) =>
                        prev.filter(
                            (e) =>
                                !(
                                    e.source === nodeId &&
                                    e.sourceHandle === handleId
                                )
                        )
                    )
                    createConnectionIfMissing(opt.nextNodeId, handleId)
                }
            })
        }, 150)
        return () => clearTimeout(timeout)
    }, [safeOptions, nodeId, createConnectionIfMissing, setEdges])

    /* 🔄 Sincronización bidireccional: detección manual (creación / eliminación) */
    useEffect(() => {
        safeOptions.forEach((opt) => {
            const handleId = getSwitchHandleId(nodeId, String(opt.id).trim())

            // Buscar edge existente desde ese handle
            const outgoingEdge = edges.find(
                (e) => e.source === nodeId && e.sourceHandle === handleId
            )

            // Caso 1️⃣: Edge fue eliminado manualmente
            if (!outgoingEdge && opt.nextNodeId && opt.nextNodeId !== 'none') {
                debug &&
                    console.log(
                        `🧭 Edge eliminado (${handleId}) → limpiar conexión`
                    )
                onUpdateConnection(opt.id, null)
            }

            // Caso 2️⃣: Edge fue creado manualmente por el usuario
            if (
                outgoingEdge &&
                (!opt.nextNodeId || opt.nextNodeId === 'none')
            ) {
                const targetNode = nodes.find(
                    (n) => n.id === outgoingEdge.target
                )
                const targetLabel =
                    targetNode?.data?.label || outgoingEdge.target
                debug &&
                    console.log(
                        `✨ Edge manual detectado: ${nodeId}::${opt.id} → ${targetLabel}`
                    )
                onUpdateConnection(opt.id, outgoingEdge.target)
            }
        })
    }, [edges, nodes, nodeId, safeOptions, onUpdateConnection, debug])

    /* 🔗 Crear o eliminar conexión manual desde el selector */
    const handleSelectChange = useCallback(
        (value: string, targetId: string | null) => {
            const handleId = getSwitchHandleId(nodeId, String(value).trim())
            setEdges((prev) =>
                prev.filter(
                    (e) => !(e.source === nodeId && e.sourceHandle === handleId)
                )
            )

            if (!targetId || targetId === 'none') {
                onUpdateConnection(value, null)
                debug && console.log(`🧹 Edge eliminado (${handleId})`)
                return
            }

            createConnectionIfMissing(targetId, handleId)
            onUpdateConnection(value, targetId)
            debug &&
                console.log(
                    `✅ Conectado ${nodeId} → ${targetId} (${handleId})`
                )
        },
        [nodeId, createConnectionIfMissing, onUpdateConnection, setEdges, debug]
    )

    /* 🎨 Render */
    return (
        <div className="mt-5 rounded-xl border border-fuchsia-400 bg-fuchsia-50/50 p-3 dark:border-fuchsia-800 dark:bg-fuchsia-900/10">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <PlugZap className="h-4 w-4 text-fuchsia-600 dark:text-fuchsia-400" />
                    <Label className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
                        🔀 Conexiones del Switch
                    </Label>
                </div>
                <Badge
                    variant="outline"
                    className="text-[10px] text-gray-600 dark:text-gray-300"
                >
                    {safeOptions.length} condiciones
                </Badge>
            </div>

            <div className="mt-3 space-y-3">
                {safeOptions.length === 0 && (
                    <div className="rounded-md border border-dashed border-fuchsia-300 px-3 py-2 text-xs text-gray-500 dark:border-fuchsia-700 dark:text-gray-400">
                        No hay condiciones configuradas aún.
                    </div>
                )}

                {safeOptions.map((opt, idx) => (
                    <div
                        key={opt.id}
                        className="flex flex-col gap-1 rounded-md border border-fuchsia-200 bg-white/70 px-3 py-2 text-xs shadow-sm dark:border-fuchsia-700 dark:bg-gray-950"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Badge
                                    variant="outline"
                                    className="border-fuchsia-300 bg-fuchsia-100 text-[10px] text-fuchsia-700 dark:border-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300"
                                >
                                    {idx + 1}
                                </Badge>
                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                    {opt.label || opt.id}
                                </span>
                            </div>

                            {opt.nextNodeId && opt.nextNodeId !== 'none' && (
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
                            value={opt.nextNodeId || 'none'}
                            onValueChange={(val) =>
                                handleSelectChange(opt.id, val || null)
                            }
                        >
                            <SelectTrigger className="h-8 border-fuchsia-400 text-xs dark:border-fuchsia-700">
                                <SelectValue placeholder="Seleccionar nodo siguiente..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Ninguno</SelectItem>
                                {availableNodes.length === 0 && (
                                    <SelectItem value="no_nodes" disabled>
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
            </div>
        </div>
    )
}
