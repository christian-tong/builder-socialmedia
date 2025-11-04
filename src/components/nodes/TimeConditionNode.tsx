// src\components\nodes\TimeConditionNode.tsx

'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🕒 TimeConditionNode (v2.4)
 * ----------------------------------------------------
 * - Muestra rango de días y horario con salto de línea
 * - Animación suave, bordes redondeados y colores adaptados
 * - Compatible con modo oscuro y orientación dinámica
 */
export default function TimeConditionNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    /** 🧠 Traducción de días ISO cortos → nombres amigables */
    const dayLabels: Record<string, string> = {
        mon: 'Lun',
        tue: 'Mar',
        wed: 'Mié',
        thu: 'Jue',
        fri: 'Vie',
        sat: 'Sáb',
        sun: 'Dom',
    }

    /** 🧩 Construye un texto legible con salto de línea:
     * Ejemplo:
     * Lun–Vie
     * 09:00 – 19:00
     */
    const displayText = useMemo(() => {
        let line1 = 'Sin días definidos'
        let line2 = 'Sin horario'

        if (data.dayStart && data.dayEnd) {
            const startLabel = dayLabels[data.dayStart] || data.dayStart
            const endLabel = dayLabels[data.dayEnd] || data.dayEnd
            line1 = `${startLabel}–${endLabel}`
        } else if (data.condition) {
            const days = data.condition.split(',')[0]
            line1 = days
                ?.replace('mon', 'Lun')
                ?.replace('tue', 'Mar')
                ?.replace('wed', 'Mié')
                ?.replace('thu', 'Jue')
                ?.replace('fri', 'Vie')
                ?.replace('sat', 'Sáb')
                ?.replace('sun', 'Dom')
        }

        if (data.startTime && data.endTime) {
            line2 = `${data.startTime} – ${data.endTime}`
        } else if (data.condition?.includes(',')) {
            const hours = data.condition.split(',')[1]
            if (hours) {
                const [start, end] = hours.split('-')
                line2 = `${start ?? ''} – ${end ?? ''}`
            }
        }

        return { line1, line2 }
    }, [data])

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14,
                mass: 0.8,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'timeConditionNode', data })
                }}
                data-id={id}
                className="relative cursor-pointer rounded-xl border border-sky-600 bg-sky-500/95 px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg dark:border-sky-700 dark:bg-sky-700/90"
            >
                <div className="flex flex-col items-center text-center">
                    {/* 🕓 Header */}
                    <div className="mb-1 flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                            {data.label || 'Condición Horaria'}
                        </span>
                    </div>

                    {/* 📅 Rango de días y horario */}
                    <div className="flex flex-col items-center text-[11px] leading-tight opacity-90">
                        <span className="font-medium">{displayText.line1}</span>
                        <span className="font-mono text-[10px] opacity-90">
                            {displayText.line2}
                        </span>
                    </div>
                </div>

                {/* 🔹 Handles */}
                <Handle
                    type="target"
                    position={targetPosition}
                    className="!bg-sky-300"
                />
                <Handle
                    type="source"
                    id="onTrue"
                    position={Position.Bottom}
                    className="!bg-green-400"
                />
                <Handle
                    type="source"
                    id="onFalse"
                    position={Position.Bottom}
                    className="ml-4 !bg-rose-400"
                />
            </Card>
        </motion.div>
    )
}
