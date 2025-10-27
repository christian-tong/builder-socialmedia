// src\config\getDataVariantsConfig.ts
// src/config/getDataVariantsConfig.ts

export const getDataVariantsConfig = {
    quick_reply: {
        label: 'Menú principal (Quick Reply)',
        color: 'violet',
        defaultObject: {
            setvariables: {},
            conditions: {},
            condition: '',
            setvar: 'PRIMER_NIVEL',
            variable: 'PrimeraOpcion',
            saveHidden: true,
            timeOut: '90000', // ✅ ← valor por defecto agregado aquí
            iterations: '1',
            interactive: {
                type: 'quick_reply',
                msgid: '',
                content: { type: 'text', text: encodeURIComponent('') },
                options: [{ type: 'text', title: '', postbackText: '' }],
            },
        },
    },

    list: {
        label: 'Menú secundario (List)',
        color: 'sky',
        defaultObject: {
            setvariables: {},
            conditions: {},
            condition: '',
            setvar: 'SEGUNDO_NIVEL',
            variable: 'SegundaOpcion',
            saveHidden: true,
            timeOut: '90000', // ✅
            iterations: '1',
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
