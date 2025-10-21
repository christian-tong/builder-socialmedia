// src\components\forms\FormMenuNodeSecundario.tsx

'use client'

import React from 'react'
import { MenuNodeFormLayout } from '@/components/shared/MenuNodeFormLayout'
import { useMenuNodeForm } from '@/hooks/useMenuNodeForm'

/**
 * 🧾 FormMenuNodeSecundario
 * --------------------------------------------------
 * - Usa el hook genérico `useMenuNodeForm`
 * - Color celeste (sky)
 * - Sin duplicar lógica ni efectos
 */
export default function FormMenuNodeSecundario({
    id,
    data,
}: {
    id: string
    data: Record<string, any>
}) {
    const hook = useMenuNodeForm(id, data)

    return (
        <MenuNodeFormLayout
            id={id}
            data={data}
            color="sky"
            variablePlaceholder="Ejemplo: SEGUNDO_NIVEL"
            variableLabel="Variable secundaria"
            hook={hook}
        />
    )
}
