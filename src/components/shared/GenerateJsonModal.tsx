// src\components\shared\GenerateJsonModal.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'
import { generateValidatedJson } from '@/lib/flowValidations'
import { useFlowChannelStore } from '@/store/useFlowChannelStore'
import { postBotFlow } from '@/services/postBotService'

export function GenerateJsonModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { isDark } = useTheme()
    const { nodes, edges } = useFlowStore()
    const { channel } = useFlowChannelStore()
    const [jsonText, setJsonText] = useState<string>('')

    // 🧩 Campos visibles del modal
    const [showPublishForm, setShowPublishForm] = useState(false)
    const [description, setDescription] = useState('')
    const [extensionAssign, setExtensionAssign] = useState('1')

    // 🧠 Generar JSON cuando se abre
    useEffect(() => {
        if (open && nodes.length > 0) {
            const json = generateValidatedJson(nodes, edges)
            if (json) setJsonText(JSON.stringify(json, null, 2))
        }
    }, [open, nodes, edges])

    // 🚀 Publicar flujo
    const handlePublish = async () => {
        if (!jsonText) {
            toast.warning('⚠️ No hay JSON para publicar')
            return
        }
        if (!description.trim()) {
            toast.warning('⚠️ Agrega una descripción antes de publicar')
            return
        }

        try {
            // ✅ Conversión segura de FlowChannelType a string | undefined
            const safeChannel = channel ?? undefined

            const response = await postBotFlow({
                configuration: jsonText,
                channel: safeChannel,
                description,
                extensionAssign,
            })

            if (response.success) {
                toast.success('✅ Flujo publicado correctamente', {
                    description: 'El flujo fue enviado al servicio con éxito.',
                })
                onOpenChange(false)
                setShowPublishForm(false)
                setDescription('')
            } else {
                toast.error('❌ Error al publicar', {
                    description:
                        response.message ?? 'Ocurrió un error desconocido.',
                })
            }
        } catch (error) {
            console.error('Error al publicar flujo:', error)
            toast.error('❌ Error al enviar el flujo')
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'flex max-h-[75vh] flex-col transition-colors sm:max-w-[900px]',
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

                {/* 🧩 Panel principal o formulario */}
                {!showPublishForm ? (
                    <>
                        <div className="flex-1 overflow-auto">
                            <Textarea
                                readOnly
                                value={jsonText}
                                className={cn(
                                    'h-full min-h-[300px] max-w-[860px] resize-none font-mono text-sm',
                                    isDark
                                        ? 'border-gray-700 bg-[#1c1c1e] text-gray-100'
                                        : 'border-gray-300 bg-gray-50 text-gray-800'
                                )}
                            />
                        </div>

                        <DialogFooter className="mt-4 flex shrink-0 justify-end">
                            <Button
                                onClick={() => setShowPublishForm(true)}
                                className={cn(
                                    'w-full text-white sm:w-auto',
                                    isDark
                                        ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-amber-500 hover:bg-amber-600'
                                )}
                            >
                                🚀 Publicar
                            </Button>
                        </DialogFooter>
                    </>
                ) : (
                    <>
                        {/* 🧾 Formulario de publicación */}
                        <div className="space-y-4 p-4">
                            <h3 className="text-base font-semibold text-indigo-500">
                                Datos para publicar flujo
                            </h3>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Descripción
                                    </label>
                                    <Input
                                        value={description}
                                        onChange={(e) =>
                                            setDescription(e.target.value)
                                        }
                                        placeholder="Ej: Flujo de Bienvenida"
                                        className="w-full"
                                    />
                                </div>

                                <div>
                                    <label className="mb-1 block text-sm font-medium">
                                        Extension Assign
                                    </label>
                                    <Input
                                        value={extensionAssign}
                                        onChange={(e) =>
                                            setExtensionAssign(e.target.value)
                                        }
                                        placeholder="Ej: 1"
                                        className="w-full"
                                    />
                                </div>
                            </div>

                            <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                Canal actual detectado:{' '}
                                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                                    {channel?.toUpperCase() ?? 'SIN CANAL'}
                                </span>
                            </div>
                        </div>

                        <DialogFooter className="mt-4 flex shrink-0 flex-col justify-between gap-2 sm:flex-row">
                            <Button
                                onClick={() => setShowPublishForm(false)}
                                variant="outline"
                                className="w-full bg-gray-900 text-white hover:bg-gray-700 hover:text-white sm:w-auto"
                            >
                                ← Volver
                            </Button>

                            <Button
                                onClick={handlePublish}
                                className={cn(
                                    'w-full text-white sm:w-auto',
                                    isDark
                                        ? 'bg-green-600 hover:bg-green-700'
                                        : 'bg-green-500 hover:bg-green-600'
                                )}
                            >
                                Confirmar y Publicar
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default GenerateJsonModal
