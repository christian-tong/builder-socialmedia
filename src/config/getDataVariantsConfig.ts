// src\config\getDataVariantsConfig.ts

// src/config/getDataVariantsConfig.ts
import { WiGetDataVariantMap } from '@/types/sj'

export const getDataVariantsConfig = {
    /** 🟣 Quick Reply — Menú Principal */
    quick_reply: {
        label: 'Menú principal (Quick Reply)',
        description:
            'Usa botones rápidos para mostrar opciones principales de selección.',
        color: 'violet',
        defaultObject: {
            setvariables: {},
            conditions: {},
            condition: '',
            setvar: 'PRIMER_NIVEL',
            variable: 'PrimeraOpcion',
            saveHidden: true,
            interactive: {
                type: 'quick_reply',
                msgid: '',
                content: {
                    type: 'text',
                    text: encodeURIComponent(''),
                },
                options: [
                    {
                        type: 'text',
                        title: '',
                        postbackText: '',
                    },
                ],
            },
        },
    },

    /** 🔵 List — Menú Secundario */
    list: {
        label: 'Menú secundario (List)',
        description:
            'Muestra un listado jerárquico con múltiples grupos de opciones.',
        color: 'sky',
        defaultObject: {
            setvariables: {},
            conditions: {},
            condition: '',
            setvar: 'SEGUNDO_NIVEL',
            variable: 'SegundaOpcion',
            saveHidden: true,
            interactive: {
                type: 'list',
                body: encodeURIComponent(''),
                globalButtons: [{ type: 'text', title: '' }],
                items: [
                    {
                        title: '',
                        options: [
                            {
                                type: 'text',
                                title: '',
                                postbackText: '',
                                description: '',
                            },
                        ],
                    },
                ],
            },
        },
    },
} as const

// 🔹 Tipo derivado automáticamente (todas las variantes disponibles)
export type VariantKey = keyof typeof getDataVariantsConfig
