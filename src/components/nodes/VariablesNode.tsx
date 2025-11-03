// src\components\nodes\VariablesNode.tsx

'use client'

import { motion } from 'framer-motion'
import { Variable } from 'lucide-react'
import React from 'react'
import { type Connection, Handle, Position } from 'reactflow'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useVariablesStore } from '@/store/useVariablesStore'

/**
 * 🟣 VariablesNode
 * ----------------------------------------------------
 * - Nodo para definir variables globales del flujo
 * - Solo permite conexiones salientes
 * - Color base: #44344F (violeta oscuro)
 */
export function VariablesNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeVariables } = useVariablesStore()

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left

    const handlePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    const isValidConnection = (connection: Connection) => {
        if (connection.target === id) {
            toast.warning('❌ Conexión no permitida', {
                description:
                    'El nodo Variables no puede recibir conexiones entrantes.',
            })
            return false
        }
        return true
    }

    const vars = getNodeVariables(id)

    return (
        <motion.div
            layout
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 90,
                damping: 12,
                mass: 0.6,
            }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'variablesNode', data })
                }}
                data-id={id}
                className="cursor-pointer rounded-lg px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-lg"
                style={{
                    backgroundColor: '#44344F',
                    borderColor: '#44344F',
                    borderWidth: 1,
                }}
            >
                <div className="mb-1 flex items-center justify-center gap-2">
                    <Variable className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {data?.label || 'Variables'}
                    </span>
                </div>

                {/* 🧩 Mostrar los valores de las variables */}
                {vars.length > 0 ? (
                    <ul className="mt-1 space-y-0.5 text-[10px] leading-tight text-gray-100">
                        {vars.slice(0, 4).map((v, i) => (
                            <li key={i} className="truncate">
                                • {v.value || '(sin valor)'}
                            </li>
                        ))}
                        {vars.length > 4 && (
                            <li className="text-[9px] text-gray-300 italic">
                                +{vars.length - 4} más
                            </li>
                        )}
                    </ul>
                ) : (
                    <p className="mt-1 text-[10px] text-gray-300 italic">
                        Sin variables
                    </p>
                )}

                <Handle
                    type="target"
                    position={targetPosition}
                    className="!bg-indigo-400"
                />

                {/* 🟣 Handle de salida */}
                <Handle
                    type="source"
                    position={handlePosition}
                    id="onTrue"
                    className="!border-none"
                    style={{ backgroundColor: '#44344F' }}
                    isValidConnection={isValidConnection}
                />
            </Card>
        </motion.div>
    )
}
