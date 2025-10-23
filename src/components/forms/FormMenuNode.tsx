// src\components\forms\FormMenuNodeGetDataComplete.tsx

'use client'

import React, { useMemo, useEffect } from 'react'
import { MenuNodeFormLayout } from '@/components/shared/MenuNodeFormLayout'
import { useMenuNodeForm } from '@/hooks/useMenuNodeForm'
import { WiGetDataComplete } from '@/types/sj'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'

export default function FormMenuNode({
    id,
    data,
}: {
    id: string
    data: WiGetDataComplete
}) {
    const hook = useMenuNodeForm(id, data as any)
    const { setVariantType } = useVariantTypeStore()

    const variant = useMemo(() => {
        const interactiveType = data?.object?.interactive?.type
        return interactiveType === 'list' ? 'list' : 'quick_reply'
    }, [data])

    // 🧠 Guardar el tipo seleccionado en Zustand
    useEffect(() => {
        setVariantType(id, variant)
    }, [id, variant, setVariantType])

    const color = variant === 'quick_reply' ? 'violet' : 'sky'
    const variableLabel =
        variant === 'quick_reply' ? 'Variable principal' : 'Variable secundaria'
    const variablePlaceholder =
        variant === 'quick_reply'
            ? 'Ejemplo: PRIMER_NIVEL'
            : 'Ejemplo: SEGUNDO_NIVEL'

    return (
        <MenuNodeFormLayout
            id={id}
            data={data}
            color={color}
            variableLabel={variableLabel}
            variablePlaceholder={variablePlaceholder}
            hook={hook}
        />
    )
}
