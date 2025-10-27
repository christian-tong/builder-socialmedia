// src\config\baseVariantFields.ts

export const baseVariantFields = {
    quick_reply: [
        {
            label: 'Variable',
            path: 'object.variable',
            placeholder: 'Ej. PrimeraOpcion',
        },
        { label: 'Alias', path: 'object.alias', placeholder: 'Alias interno' },
        { label: 'Iteraciones', path: 'object.iterations', placeholder: '1' },
        { label: 'Timeout (ms)', path: 'object.timeOut', placeholder: '90000' },
        {
            label: 'SetVar',
            path: 'object.setvar',
            placeholder: 'Ej. PRIMER_NIVEL',
        },
        {
            label: 'Condition (regex)',
            path: 'object.condition',
            placeholder: 'Ej. [1-3]',
        },
    ],
    list: [
        {
            label: 'Variable',
            path: 'object.variable',
            placeholder: 'Ej. SegundaOpcion',
        },
        { label: 'Alias', path: 'object.alias', placeholder: 'Alias interno' },
        { label: 'Iteraciones', path: 'object.iterations', placeholder: '1' },
        { label: 'Timeout (ms)', path: 'object.timeOut', placeholder: '90000' },
        {
            label: 'SetVar',
            path: 'object.setvar',
            placeholder: 'Ej. SEGUNDO_NIVEL',
        },
        {
            label: 'Condition (regex)',
            path: 'object.condition',
            placeholder: 'Ej. [0-9]',
        },
    ],
}
