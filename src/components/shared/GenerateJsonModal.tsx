// src\components\shared\GenerateJsonModal.tsx

'use client'

import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useTheme } from '@/hooks/useTheme'
import { useFlowStore } from '@/store/useFlowStore'
import { generateConversationJson } from '@/lib/jsonFlowGenerator'

/**
 * 🧩 GenerateJsonModal — Modal para generar y copiar JSON conversacional
 * --------------------------------------------------------------------
 * - Usa los nodos y edges del flujo actual (useFlowStore)
 * - Genera JSON procesado (no el formato de ReactFlow)
 * - Permite copiar al portapapeles
 */
export function GenerateJsonModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { isDark } = useTheme()
    const { nodes, edges } = useFlowStore()
    const [jsonText, setJsonText] = useState<string>('')

    /** 🧠 Genera el JSON automáticamente al abrir el modal */
    useEffect(() => {
        if (open && nodes.length > 0) {
            try {
                const json = generateConversationJson(nodes, edges)
                const jsonStr = JSON.stringify(json, null, 2)
                setJsonText(jsonStr)
            } catch (err) {
                console.error('Error generando JSON:', err)
                toast.error('❌ Error al generar el JSON del flujo')
            }
        }
    }, [open, nodes, edges])

    /** 📋 Copiar JSON al portapapeles */
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonText)
            toast.success('✅ JSON copiado al portapapeles', {
                description: 'Ya puedes pegarlo en tu editor o Postman.',
            })
            onOpenChange(false)
        } catch (error) {
            toast.error('❌ Error al copiar JSON')
        }
    }

    /** 🔁 Regenerar JSON manualmente (por si se editó el flujo abierto) */
    const handleRegenerate = () => {
        const json = generateConversationJson(nodes, edges)
        setJsonText(JSON.stringify(json, null, 2))
        toast.info('🔄 JSON actualizado')
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'transition-colors sm:max-w-[700px]',
                    isDark
                        ? 'border-gray-800 bg-[#141416] text-gray-200'
                        : 'border-gray-200 bg-white text-gray-800'
                )}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-semibold">
                        Generar JSON Conversacional
                    </DialogTitle>
                </DialogHeader>

                <Textarea
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className={cn(
                        'min-h-[360px] resize-none font-mono text-sm transition-colors',
                        isDark
                            ? 'border-gray-700 bg-[#1c1c1e] text-gray-100 focus-visible:ring-indigo-600'
                            : 'border-gray-300 bg-gray-50 text-gray-800 focus-visible:ring-indigo-500'
                    )}
                />

                <DialogFooter className="mt-4 flex flex-col justify-between gap-2 sm:flex-row">
                    <Button
                        onClick={handleRegenerate}
                        variant="outline"
                        className={cn(
                            'w-full sm:w-auto',
                            isDark
                                ? 'border-indigo-600 text-indigo-400 hover:bg-indigo-950'
                                : 'border-indigo-500 text-indigo-600 hover:bg-indigo-50'
                        )}
                    >
                        🔄 Actualizar JSON
                    </Button>

                    <Button
                        onClick={handleCopy}
                        className={cn(
                            'w-full text-white sm:w-auto',
                            isDark
                                ? 'bg-green-600 hover:bg-green-700'
                                : 'bg-green-500 hover:bg-green-600'
                        )}
                    >
                        Copiar y cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default GenerateJsonModal
