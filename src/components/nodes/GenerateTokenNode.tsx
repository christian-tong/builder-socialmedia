// src\components\nodes\GenerateTokenNode.tsx

'use client'

import { motion } from 'framer-motion'
import { KeyRound } from 'lucide-react'
import { Handle, Position } from 'reactflow'
import { Card } from '@/components/ui/card'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'
import { useGenerateTokenStore } from '@/store/useGenerateTokenStore'

export default function GenerateTokenNode({ id, data }: any) {
    const { setSelectedNode } = useNodeConfigStore()
    const { orientation } = useFlowOrientationStore()
    const { getNodeData } = useGenerateTokenStore()

    const nodeData = getNodeData(id)
    const handleTarget =
        orientation === 'vertical' ? Position.Top : Position.Left
    const handleSource =
        orientation === 'vertical' ? Position.Bottom : Position.Right

    return (
        <motion.div
            layout
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
        >
            <Card
                onClick={(e) => {
                    e.stopPropagation()
                    setSelectedNode({ id, type: 'generateTokenNode', data })
                }}
                className="relative w-[240px] cursor-pointer rounded-xl border border-[#AA3E98] bg-[#C969B9] p-3 text-white shadow-md transition hover:shadow-lg"
            >
                <div className="mb-1 flex items-center gap-2">
                    <KeyRound className="h-4 w-4 text-white" />
                    <span className="text-sm font-semibold">
                        {data?.label || id}
                    </span>
                </div>
                <div className="text-[11px] leading-tight text-gray-300">
                    <div>
                        <span className="font-semibold text-white">
                            Modo:
                        </span>{' '}
                        {nodeData.mode}
                    </div>
                    <div>
                        <span className="font-semibold text-white">
                            Texto:
                        </span>{' '}
                        {nodeData.text}
                    </div>
                    <div className="truncate">
                        <span className="font-semibold text-white">
                            Body:
                        </span>{' '}
                        {Object.keys(nodeData.body || {}).length} params
                    </div>
                </div>

                <Handle
                    type="target"
                    position={handleTarget}
                    className="!bg-[#AA3E98]"
                />
                <Handle
                    type="source"
                    position={handleSource}
                    id="onTrue"
                    className="!bg-[#C65DB2]"
                />
            </Card>
        </motion.div>
    )
}
