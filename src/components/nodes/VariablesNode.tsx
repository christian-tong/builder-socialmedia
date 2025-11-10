// src\components\nodes\VariablesNode.tsx
'use client'

import { motion } from 'framer-motion'
import { Variable } from 'lucide-react'
import React from 'react'
import { Handle, Position, type Connection } from 'reactflow'
import { toast } from 'sonner'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useVariablesStore } from '@/store/useVariablesStore'
import { useSettingsStore } from '@/store/useSettngsStore'
import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent,
} from '@/components/ui/tooltip'

/**
 * 🟣 VariablesNode (v3.0 – SimplifiedView + Tooltip)
 * ----------------------------------------------------
 * ✅ Vista simplificada con ícono centrado
 * ✅ Tooltip dinámico con descripción (o lista truncada de variables)
 * ✅ Manejo de orientación vertical/horizontal
 * ✅ Prevención de conexiones entrantes
 * ✅ Colores base #44344F / #6B4F80 coherentes con FormVariablesNode
 */
export function VariablesNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeVariables } = useVariablesStore()
    const { simplifiedView } = useSettingsStore()

    const vars = getNodeVariables(id) || []

    const targetPosition =
        orientation === 'vertical' ? Position.Top : Position.Left
    const sourcePosition =
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

    // 🧠 Tooltip dinámico (prioridad: descripción → valores → label)
    const tooltipDescription =
        data.description?.trim() ||
        (vars.length > 0
            ? `Variables definidas: ${vars
                  .map((v) => v.value || '(sin valor)')
                  .slice(0, 3)
                  .join(', ')}${
                  vars.length > 3 ? `, +${vars.length - 3} más` : ''
              }`
            : data.label?.trim() || 'Variables sin descripción')

    return (
        <motion.div
            layout
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
                type: 'spring',
                stiffness: 85,
                damping: 14,
                mass: 0.6,
            }}
        >
            <TooltipProvider delayDuration={150}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Card
                            onClick={(e) => {
                                e.stopPropagation()
                                setSelectedNode({
                                    id,
                                    type: 'variablesNode',
                                    data,
                                })
                            }}
                            data-id={id}
                            className={`cursor-pointer border border-[#6B4F80] bg-[#44344F] text-white shadow-md transition-all duration-300 ease-out select-none hover:scale-[1.03] hover:shadow-lg ${
                                simplifiedView
                                    ? 'flex size-12 items-center justify-center rounded-2xl'
                                    : 'relative w-full max-w-[240px] rounded-xl px-3 py-2 text-center'
                            }`}
                        >
                            {simplifiedView ? (
                                // 🟣 Ícono centrado en vista compacta
                                <div className="flex h-full w-full items-center justify-center">
                                    <Variable
                                        className={`${
                                            simplifiedView ? 'size-7' : 'size-4'
                                        }`}
                                    />
                                </div>
                            ) : (
                                // 🧩 Vista completa
                                <div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
                                    {/* 🔹 Título */}
                                    <div className="flex items-center justify-center gap-2">
                                        <Variable className="h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm font-medium break-words">
                                            {data.label || 'Variables'}
                                        </span>
                                    </div>

                                    {/* 🔹 Variables listadas */}
                                    {vars.length > 0 ? (
                                        <ul className="mt-1 space-y-0.5 text-[10px] leading-tight text-gray-100">
                                            {vars.slice(0, 4).map((v, i) => (
                                                <li
                                                    key={i}
                                                    className="truncate"
                                                >
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
                                </div>
                            )}

                            {/* 🟣 Handles */}
                            <Handle
                                type="target"
                                position={targetPosition}
                                className="!bg-violet-400"
                            />
                            <Handle
                                type="source"
                                position={sourcePosition}
                                id="onTrue"
                                className="!bg-violet-400"
                                isValidConnection={isValidConnection}
                            />
                        </Card>
                    </TooltipTrigger>

                    {/* 💬 Tooltip en vista simplificada */}
                    {simplifiedView && (
                        <TooltipContent
                            side="top"
                            className="max-w-[220px] text-center text-xs font-medium"
                        >
                            <div className="flex flex-col">
                                <span className="text-[10px] opacity-70">
                                    ID: {id}
                                </span>
                                <span>{tooltipDescription}</span>
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </motion.div>
    )
}
