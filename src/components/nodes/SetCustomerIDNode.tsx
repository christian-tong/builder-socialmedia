// src\components\nodes\SetCustomerIDNode.tsx

'use client'

import { motion } from 'framer-motion'
import { IdCard } from 'lucide-react'
import React from 'react'
import { Handle, Position, type Connection } from 'reactflow'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🧠 SetCustomerIDNode
 * ----------------------------------------------------
 * - Nodo que asigna el ID del cliente al flujo (DOCUMENTO)
 * - Solo tiene conexión de salida (onTrue)
 * - Color base: #2C5282 (azul acero)
 */
export default function SetCustomerIDNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handlePosition =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    const isValidConnection = (connection: Connection) => {
        if (connection.target === id) {
            toast.warning('❌ Conexión no permitida', {
                description: 'Este nodo no puede recibir conexiones entrantes.',
            })
            return false
        }
        return true
    }

    const variable = data?.object?.variable || 'DOCUMENTO'
    const alias = data?.object?.alias || 'DOCUMENTO'

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
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
                    setSelectedNode({ id, type: 'setCustomerIDNode', data })
                }}
                data-id={id}
                className="cursor-pointer rounded-lg px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-lg"
                style={{
                    backgroundColor: '#2C5282',
                    borderColor: '#2C5282',
                    borderWidth: 1,
                }}
            >
                <div className="mb-1 flex items-center justify-center gap-2">
                    <IdCard className="h-4 w-4" />
                    <span className="text-sm font-medium">
                        {data?.label || 'Set Customer ID'}
                    </span>
                </div>

                <div className="text-center text-[10px] leading-tight text-gray-100">
                    Variable: <strong>{variable}</strong>
                    <br />
                    Alias: <strong>{alias}</strong>
                </div>

                <Handle
                    type="target"
                    position={targetPosition}
                    className="!bg-indigo-400"
                />

                {/* 🔵 Handle de salida */}
                <Handle
                    type="source"
                    position={handlePosition}
                    id="onTrue"
                    className="!border-none"
                    style={{ backgroundColor: '#2C5282' }}
                    isValidConnection={isValidConnection}
                />
            </Card>
        </motion.div>
    )
}
