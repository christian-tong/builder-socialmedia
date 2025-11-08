// src\components\edges\SmartEdge.tsx
// src/components/edges/SmartEdge.tsx
'use client'

import React from 'react'
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
    type EdgeProps,
} from 'reactflow'

/**
 * ⚙️ SmartEdge (v1.1 – TypeSafe Anti-Overlap Routing)
 * ------------------------------------------------------------
 * - Curvas Bézier con desvíos dinámicos (offsetIndex / offsetStrength)
 * - Totalmente tipado y compatible con ReactFlow 11.x
 * - Ideal para flujos con múltiples edges desde un mismo nodo
 */
export function SmartEdge({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    style = {},
    markerEnd,
    label,
    labelBgStyle,
    data,
}: EdgeProps) {
    // ⚙️ Parámetros personalizados con valores por defecto
    const curvature: number = data?.curvature ?? 0.35
    const offsetIndex: number = data?.offsetIndex ?? 0
    const offsetStrength: number = data?.offsetStrength ?? 40 // píxeles de separación

    // 🔀 Desviación calculada según orientación
    const curvedTargetY = targetY + offsetIndex * offsetStrength
    const curvedTargetX = targetX + offsetIndex * offsetStrength

    // 🧭 Detecta si el flujo es más horizontal o vertical
    const isHorizontal =
        Math.abs(sourceX - targetX) > Math.abs(sourceY - targetY)

    // 🧮 Calcula la ruta Bézier con desplazamiento dinámico
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        targetX: isHorizontal ? curvedTargetX : targetX,
        targetY: isHorizontal ? targetY : curvedTargetY,
        sourcePosition,
        targetPosition,
        curvature,
    })

    return (
        <>
            <BaseEdge
                id={id}
                path={edgePath}
                style={style}
                markerEnd={markerEnd}
            />
            {label && (
                <EdgeLabelRenderer>
                    <div
                        style={{
                            position: 'absolute',
                            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                            pointerEvents: 'all',
                            ...labelBgStyle,
                        }}
                        className="nodrag nopan rounded bg-white/80 px-1 py-0.5 text-[10px] text-gray-700 dark:bg-black/60 dark:text-gray-200"
                    >
                        {label}
                    </div>
                </EdgeLabelRenderer>
            )}
        </>
    )
}

export default SmartEdge
