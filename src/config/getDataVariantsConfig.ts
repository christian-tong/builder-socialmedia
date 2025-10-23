// src\config\getDataVariantsConfig.ts

import { WiGetDataVariantMap } from '@/types/sj'

/**
 * 🎛️ getDataVariantsConfig
 * --------------------------------------------------
 * Config central de variantes para nodos `getdatacomplete`
 * Define la estructura base del `object` sin datos predefinidos.
 */
export const getDataVariantsConfig: Record<
    WiGetDataVariantMap['variant'],
    {
        label: string
        description: string
        color: string
        defaultObject: any
    }
> = {
    /** 🟣 Quick Reply — Menú Principal */
    quick_reply: {
        label: 'Menú principal (Quick Reply)',
        description:
            'Usa botones rápidos para mostrar opciones principales de selección.',
        color: 'violet',
        defaultObject: {
            setvariables: {},
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
}
