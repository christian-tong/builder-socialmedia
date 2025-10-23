// src\config\baseVariantFields.ts

export const baseVariantFields = [
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
]
