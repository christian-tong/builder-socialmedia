// src\components\shared\BeforeUnloadModal.tsx

'use client'

import { AlertTriangle, XCircle } from 'lucide-react'
import React from 'react'
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

interface BeforeUnloadModalProps {
    open: boolean
    onConfirm: () => void // ✅ salir / recargar
    onCancel: () => void // ❌ quedarse
}

/**
 * ⚠️ BeforeUnloadModal — Confirmación visual al intentar salir o recargar
 * -----------------------------------------------------------------------
 * - Usa el estilo del ImportJsonModal
 * - Muestra un mensaje de advertencia
 * - Requiere confirmación para proceder
 */
export function BeforeUnloadModal({
    open,
    onConfirm,
    onCancel,
}: BeforeUnloadModalProps) {
    const { isDark } = useTheme()

    return (
        <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
            <DialogContent
                className={cn(
                    'transition-colors sm:max-w-[420px]',
                    isDark
                        ? 'border-gray-800 bg-[#141416] text-gray-200'
                        : 'border-gray-200 bg-white text-gray-800'
                )}
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Cambios sin guardar
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center px-4 py-6 text-center">
                    <p className="text-sm leading-relaxed">
                        Tienes cambios en tu flujo que aún no se han guardado.{' '}
                        <br />
                        Si sales o recargas la página,{' '}
                        <span className="font-semibold">
                            perderás los datos no guardados.
                        </span>
                    </p>

                    <div className="mt-4">
                        <XCircle className="h-10 w-10 text-red-500 opacity-70" />
                    </div>
                </div>

                <DialogFooter className="mt-4 flex justify-between">
                    <Button
                        variant="ghost"
                        onClick={onCancel}
                        className="text-gray-500 hover:bg-transparent"
                    >
                        Cancelar
                    </Button>

                    <Button
                        onClick={onConfirm}
                        className={cn(
                            'text-white',
                            isDark
                                ? 'bg-red-600 hover:bg-red-700'
                                : 'bg-red-500 hover:bg-red-600'
                        )}
                    >
                        Salir sin guardar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default BeforeUnloadModal
