// src/components/shared/OptionFlowManager.tsx
'use client'

import React from 'react'
import { NodeSelectAccordion } from '@/components/shared/NodeSelectAccordion'
import { useNodeConnections } from '@/hooks/useNodeConnections'
import { useFlowStore } from '@/store/useFlowStore'

interface OptionFlowManagerProps {
    id: string
    optionKey: string // el postbackText
    selectedId?: string
    onSelect: (targetId: string) => void
    availableNodes: any[]
    accentColor?: string
    deferred?: boolean
}

/**
 * 🧭 OptionFlowManager
 * ---------------------------------------------------
 * - Permite conectar cada opción a un siguiente nodo
 * - Similar a NodeFlowConnectionsManager pero más simple
 */
export function OptionFlowManager({
    id,
    optionKey,
    selectedId,
    onSelect,
    availableNodes,
    accentColor = 'text-emerald-600',
    deferred = true,
}: OptionFlowManagerProps) {
    const { createConnectionIfMissing } = useNodeConnections(id)
    const { edges } = useFlowStore()

    const handleSelect = (targetId: string) => {
        onSelect(targetId)

        if (!deferred && targetId) {
            const exists = edges.some(
                (e) =>
                    e.source === id &&
                    e.sourceHandle === optionKey &&
                    e.target === targetId
            )
            if (!exists) createConnectionIfMissing(targetId, optionKey)
        }
    }

    return (
        <NodeSelectAccordion
            title={`Conexión de opción ${optionKey}`}
            availableNodes={availableNodes}
            selectedId={selectedId}
            handleId={optionKey}
            sourceId={id}
            onSelect={handleSelect}
            onUnselect={() => handleSelect('')}
            accentColor={accentColor}
        />
    )
}
