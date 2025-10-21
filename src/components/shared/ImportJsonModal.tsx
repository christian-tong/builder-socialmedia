// src\components\shared\ImportJsonModal.tsx

'use client'

import { CheckCircle2, FileJson, UploadCloud, XCircle } from 'lucide-react'
import type React from 'react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * 🧩 ImportJsonModal — Subida y validación de archivos JSON
 * --------------------------------------------------------------------
 * - Soporta formato ReactFlow (nodes + edges)
 * - Soporta formato WiContact (process.steps)
 * - Usa Sonner para feedback visual
 * - Compatible con modo claro/oscuro
 */
export function ImportJsonModal({
    open,
    onOpenChange,
}: {
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { isDark } = useTheme()
    const { importFlow } = useFlowStore()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const [status, setStatus] = useState<
        'idle' | 'valid' | 'invalid' | 'checking'
    >('idle')
    const [fileType, setFileType] = useState<'ReactFlow' | 'WiContact' | null>(
        null
    )

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Validar extensión
        if (!file.name.endsWith('.json')) {
            setStatus('invalid')
            toast.error('El archivo debe tener extensión .json')
            e.target.value = ''
            return
        }

        setStatus('checking')

        try {
            const text = await file.text()
            const data = JSON.parse(text)

            // ✅ Detectar formato automáticamente
            if (data?.nodes && Array.isArray(data.nodes)) {
                setFileType('ReactFlow')
                setStatus('valid')
                setSelectedFile(file)
                toast.success('Archivo JSON válido (React Flow)')
            } else if (
                data?.process?.steps &&
                Array.isArray(data.process.steps)
            ) {
                setFileType('WiContact')
                setStatus('valid')
                setSelectedFile(file)
                toast.success('Archivo JSON válido (WiContact)')
            } else {
                setStatus('invalid')
                setFileType(null)
                toast.error('❌ Formato JSON no compatible.')
            }
        } catch (err) {
            console.error('Error al leer JSON:', err)
            setStatus('invalid')
            toast.error('❌ Archivo JSON corrupto o ilegible.')
        }

        e.target.value = ''
    }

    const handleImport = async () => {
        if (!selectedFile) return
        await importFlow(selectedFile)
        onOpenChange(false)
        setSelectedFile(null)
        setStatus('idle')
        setFileType(null)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    'transition-colors sm:max-w-[480px]',
                    isDark
                        ? 'border-gray-800 bg-[#141416] text-gray-200'
                        : 'border-gray-200 bg-white text-gray-800'
                )}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <UploadCloud className="h-5 w-5 text-blue-500" />
                        Importar Flujo JSON
                    </DialogTitle>
                </DialogHeader>

                <div
                    className={cn(
                        'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors',
                        isDark
                            ? 'border-gray-700 hover:border-indigo-600'
                            : 'border-gray-300 hover:border-indigo-500'
                    )}
                    onClick={() => fileInputRef.current?.click()}
                >
                    <input
                        placeholder="Subir archivo"
                        ref={fileInputRef}
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <FileJson
                        className={cn(
                            'mb-3 h-10 w-10',
                            status === 'valid'
                                ? 'text-green-500'
                                : status === 'invalid'
                                  ? 'text-red-500'
                                  : status === 'checking'
                                    ? 'animate-pulse text-yellow-500'
                                    : 'text-gray-400'
                        )}
                    />

                    {/* Texto de estado */}
                    <p className="text-center text-sm">
                        {status === 'idle' &&
                            'Haz clic o arrastra un archivo .json válido'}
                        {status === 'checking' && 'Verificando archivo...'}
                        {status === 'valid' && (
                            <span className="flex items-center justify-center gap-1 text-green-500">
                                <CheckCircle2 className="h-4 w-4" />
                                Archivo válido ({fileType})
                            </span>
                        )}
                        {status === 'invalid' && (
                            <span className="flex items-center justify-center gap-1 text-red-500">
                                <XCircle className="h-4 w-4" />
                                Archivo inválido o incompatible
                            </span>
                        )}
                    </p>

                    {selectedFile && (
                        <p className="mt-2 text-xs opacity-70">
                            {selectedFile.name}
                        </p>
                    )}
                </div>

                <DialogFooter className="mt-4 flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => {
                            onOpenChange(false)
                            setSelectedFile(null)
                            setStatus('idle')
                            setFileType(null)
                        }}
                    >
                        Cancelar
                    </Button>

                    <Button
                        disabled={!selectedFile || status !== 'valid'}
                        onClick={handleImport}
                        className={cn(
                            'text-white',
                            isDark
                                ? 'bg-blue-600 hover:bg-blue-700'
                                : 'bg-blue-500 hover:bg-blue-600'
                        )}
                    >
                        Importar y aplicar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ImportJsonModal
