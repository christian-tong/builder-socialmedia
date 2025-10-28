// src\components\forms\FormNoOpNode.tsx

'use client'

import React, { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { useNodeConfigStore } from '@/store/useNodeConfigStore'

/**
 * 🟤 FormNoOpNode
 * ----------------------------------------------------
 * - Nodo sin lógica operativa
 * - Solo muestra información descriptiva
 * - No usa store especializado
 */
export default function FormNoOpNode({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const { registerSaveCallback, unregisterSaveCallback } =
        useNodeConfigStore()

    // 💾 Se registra callback vacío para mantener consistencia del patrón
    useEffect(() => {
        registerSaveCallback(id, () => {
            console.log(`🟤 [NoOpNode] Guardado noop para id: ${id}`)
        })
        return () => unregisterSaveCallback(id)
    }, [id])

    return (
        <div className="flex flex-col gap-5">
            {/* 🔹 Encabezado */}
            <div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
                <Label
                    className="text-sm font-semibold"
                    style={{ color: '#6B7280' }}
                >
                    Nodo NoOp (sin operación)
                </Label>
                <Badge
                    variant="outline"
                    className="px-2 py-0.5 text-[10px]"
                    style={{
                        borderColor: '#6B7280',
                        color: '#6B7280',
                        backgroundColor: 'rgba(107,114,128,0.08)',
                    }}
                >
                    {id}
                </Badge>
            </div>

            {/* 🔸 Descripción */}
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
                Este nodo no ejecuta ninguna acción. Útil para separar flujos,
                pruebas o placeholders temporales.
            </p>
        </div>
    )
}
