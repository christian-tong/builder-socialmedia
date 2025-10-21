// src\components\forms\FormMenuNodePrincipal.tsx

'use client'

import React from 'react'
import { MenuNodeFormLayout } from '@/components/shared/MenuNodeFormLayout'
import { useMenuNodeForm } from '@/hooks/useMenuNodeForm'

/**
 * 🟣 FormMenuNodePrincipal
 * --------------------------------------------------
 * - Usa el hook genérico `useMenuNodeForm`
 * - Renderiza el layout estándar con color violeta
 * - Sin duplicar lógica ni efectos locales
 */
export default function FormMenuNodePrincipal({
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
            color="violet"
            variablePlaceholder="Ejemplo: PRIMER_NIVEL"
            variableLabel="Variable principal"
            hook={hook}
        />
    )
}
