// src\components\nodes\SetCustomerIDNode.tsx

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { IdCard } from 'lucide-react'
import { Handle, Position, type Connection } from 'reactflow'
import { Card } from '@/components/ui/card'
import { toast } from 'sonner'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import {
    useSetCustomerIDStore,
    type SetCustomerIDObject,
} from '@/store/useSetCustomerIDStore'

/**
 * 🧠 SetCustomerIDNode (v2.0 — formato JSON estilo GenerateTokenNode)
 * -------------------------------------------------------------------
 * - Renderiza object.options como bloque JSON “pretty”
 * - Estilo visual coherente con GenerateTokenNode
 * - Sin dependencias del formulario (usa Zustand)
 * - Color base: #2C5282 (azul acero)
 */
export default function SetCustomerIDNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useSetCustomerIDStore()

    const nodeData: SetCustomerIDObject = getNodeData(id)
    const options = nodeData?.options ?? {}

    // 📐 Posiciones según orientación
    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    // ⚠️ Evita conexiones entrantes
    const isValidConnection = (connection: Connection): boolean => {
        if (connection.target === id) {
            toast.warning('❌ Conexión no permitida', {
                description: 'Este nodo no puede recibir conexiones entrantes.',
            })
            return false
        }
        return true
    }

    // 🧾 Formato JSON truncado (máx. 5 líneas)
    let formattedJSON = '{}'
    try {
        const jsonStr = JSON.stringify(options, null, 2)
        const lines = jsonStr.split('\n')
        formattedJSON =
            lines.length > 5 ? lines.slice(0, 5).join('\n') + '\n...' : jsonStr
    } catch {
        formattedJSON = String(options)
    }

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 12 }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'setCustomerIDNode', data })
                }}
                data-id={id}
                className="relative w-[240px] cursor-pointer overflow-hidden rounded-xl border border-[#1E3A5F] bg-[#2C5282] p-3 text-white shadow-md transition-all hover:scale-[1.02] hover:shadow-lg"
            >
                {/* 🔹 Header */}
                <div className="flex items-center justify-between border-b border-white/20 pb-1">
                    <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-white" />
                        <span className="text-sm font-semibold">
                            {data?.label || 'Set Customer ID'}
                        </span>
                    </div>
                </div>

                {/* 🧾 Contenido estilo JSON */}
                <div className="space-y-1 pt-2 text-[11px] leading-tight text-gray-200">
                    <div>
                        <span className="font-semibold text-white">
                            Opciones:
                        </span>
                    </div>

                    <div className="rounded-md border border-white/20 bg-white/10 px-2 py-1 font-mono text-[10px] whitespace-pre-wrap text-white">
                        <pre className="max-h-[80px] overflow-hidden whitespace-pre-wrap">
                            {formattedJSON}
                        </pre>
                    </div>
                </div>

                {/* 🟦 Handles */}
                <Handle
                    type="target"
                    position={handleTarget}
                    className="!bg-[#4A6FA5]"
                    isValidConnection={isValidConnection}
                />
                <Handle
                    type="source"
                    position={handleSource}
                    id="onTrue"
                    className="!bg-[#2C5282]"
                />
            </Card>
        </motion.div>
    )
}
