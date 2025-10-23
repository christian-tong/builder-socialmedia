// src\components\forms\FormMenuNodeGetDataComplete.tsx

'use client'

import React, { useMemo } from 'react'
import { MenuNodeFormLayout } from '@/components/shared/MenuNodeFormLayout'
import { useMenuNodeForm } from '@/hooks/useMenuNodeForm'
import { WiGetDataComplete } from '@/types/sj'

/**
 * 🧠 FormMenuNodeGetDataComplete
 * --------------------------------------------------
 * Formulario unificado para ambos tipos de nodos:
 * - Menú Principal (quick_reply)
 * - Menú Secundario (list)
 *
 * Detecta automáticamente el tipo de interacción y
 * ajusta colores, labels y placeholders dinámicamente.
 */
export default function FormMenuNode({
	id,
	data,
}: {
	id: string
	data: WiGetDataComplete
}) {
	const hook = useMenuNodeForm(id, data as any)

	// 🧩 Determinar tipo de comportamiento
	const variant = useMemo(() => {
		const interactiveType = data?.object?.interactive?.type
		if (interactiveType === 'list') return 'list'
		return 'quick_reply' // default
	}, [data])

	// 🎨 Configuración dinámica según el tipo
	const color = variant === 'quick_reply' ? 'violet' : 'sky'
	const variableLabel =
		variant === 'quick_reply'
			? 'Variable principal'
			: 'Variable secundaria'
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
