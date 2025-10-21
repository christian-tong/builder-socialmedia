// src\components\nodes\EndNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Power } from 'lucide-react'
import React from 'react'
import { type Connection, Handle, Position } from 'reactflow'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🔴 EndNode
 * ----------------------------------------------------
 * - Nodo final del flujo
 * - Solo acepta conexiones entrantes
 */
export default function EndNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()

    const handlePosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    // 🚫 Evita conexiones salientes
    const isValidConnection = (connection: Connection) => {
        if (connection.source === id) {
            toast.warning('Conexión no permitida', {
                description:
                    'El nodo de Fin no puede tener conexiones salientes.',
            })
            return false
        }
        return true
    }

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 90,
                damping: 15,
                mass: 0.7,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'endNode', data }) // ✅ mantiene coherencia
                }}
                data-id={id}
                data-animated={data.__animated ? 'true' : 'false'}
                className="cursor-pointer rounded-lg border border-rose-700 bg-rose-600 px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg"
            >
                <div className="flex items-center justify-center gap-2">
                    <Power className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {data.label || 'Fin'}
                    </span>
                </div>

                {/* 🔴 Handle de conexión (entrada) */}
                <Handle
                    type="target"
                    position={handlePosition}
                    className="!bg-rose-400"
                    isValidConnection={isValidConnection}
                />
            </Card>
        </motion.div>
    )
}
