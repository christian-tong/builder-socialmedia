// src\types\getDataComplete.ts

/**
 * 🧠 GetDataComplete Types (v6.4)
 * ------------------------------------------------------------
 * Compatibilidad extendida:
 *  - Soporta variantes mayúsculas/minúsculas
 *  - Añade propiedad `description` para SIMPLETEXT y GETDATA
 *  - Mantiene compatibilidad con versiones anteriores del flujo
 * ------------------------------------------------------------
 */

export interface GetDataCompleteNodeFull {
    id: string
    action: 'getdatacomplete'
    isInteractive: boolean
    onTrue: string
    onError: string
    onFalse: string
    source: string
    interactiveVersion?: number
    object: GetDataCompleteObject
    /** 📝 Descripción visible del nodo (metadato opcional) */
    description?: string
    isTemplate?: boolean
    onTimeOut?: string
    onTimeOutError?: string
}

/* -------------------------------------------------------------------------- */
/* 🧱 Objeto principal                                                        */
/* -------------------------------------------------------------------------- */

export interface GetDataCompleteObject {
    id?: string | number

    action?: string
    /** 🧩 Variables a establecer en flujo */
    setvariables: Record<string, string>

    /** 🔀 Condición o expresión */
    condition: string

    /** 🧾 Texto secundario o nota */
    groodText?: string

    /** 🔤 Variable principal asociada */
    setvar: string

    /** 📥 Variable destino */
    variable: string

    /** 🧱 Persistencia */
    saveHidden: boolean

    /** 🏷️ Alias descriptivo */
    alias: string

    /** 🔗 Condiciones (key → targetId) */
    conditions: Record<string, string>

    /** 🔁 Número de iteraciones */
    iterations: string

    /** ⏱️ Tiempo de espera */
    timeOut: string

    /** 🔠 Tipo de nodo */
    type?:
        | 'quick_reply'
        | 'list'
        | 'GETDATA'
        | 'getdata'
        | 'SIMPLETEXT'
        | 'simple_text'

    /** 💬 Prompt o texto principal (usado en SIMPLETEXT o GETDATA) */
    prompt?: string

    /** 📝 Descripción extendida del nodo (solo SIMPLETEXT/GETDATA) */
    description?: string

    /** 💬 Bloque interactivo (solo quick_reply o list) */
    interactive?: InteractiveBlock
}

/* -------------------------------------------------------------------------- */
/* 💬 Bloques interactivos                                                   */
/* -------------------------------------------------------------------------- */

export type InteractiveBlock =
    | QuickReplyInteractive
    | ListInteractive
    | GetDataInteractive
    | SimpleTextInteractive

export interface QuickReplyInteractive {
    msgid: string
    type: 'quick_reply'
    content: {
        text: string
        type: 'text'
    }
    options: QuickReplyOption[]
    conditions?: Record<string, string>
}

export interface QuickReplyOption {
    postbackText: string
    type: 'text'
    title: string
    description?: string
    nextNodeId?: string
}

export interface ListInteractive {
    type: 'list'
    globalButtons?: GlobalButton[]
    body: string
    items: ListItem[]
    conditions?: Record<string, string>
}

export interface GlobalButton {
    type: 'text'
    title: string
}

export interface ListItem {
    title: string
    options: ListOption[]
}

export interface ListOption {
    postbackText: string
    type: 'text'
    title: string
    description?: string

    /** 🔗 Nodo siguiente (solo para renderización visual en ReactFlow) */
    nextNodeId?: string
}

export interface GetDataInteractive {
    type: 'GETDATA'
    prompt?: string
    /** 📝 Nueva compatibilidad para descripción */
    description?: string
}

export interface SimpleTextInteractive {
    type: 'SIMPLETEXT'
    prompt: string
    /** 📝 Nueva compatibilidad para descripción */
    description?: string
}

/* -------------------------------------------------------------------------- */
/* 🧩 Type Guards                                                             */
/* -------------------------------------------------------------------------- */

export function isQuickReplyInteractive(
    interactive: InteractiveBlock
): interactive is QuickReplyInteractive {
    return interactive.type === 'quick_reply'
}

export function isListInteractive(
    interactive: InteractiveBlock
): interactive is ListInteractive {
    return interactive.type === 'list'
}

export function isGetDataInteractive(
    interactive: InteractiveBlock
): interactive is GetDataInteractive {
    return interactive.type === 'GETDATA'
}

/* -------------------------------------------------------------------------- */
/* 🏗️ Factories                                                              */
/* -------------------------------------------------------------------------- */

/**
 * ✅ Compatibilidad extendida:
 * Acepta tanto 'GETDATA' | 'SIMPLETEXT' como 'getdata' | 'simple_text'
 */
export function createEmptyInteractive(
    type:
        | 'quick_reply'
        | 'list'
        | 'GETDATA'
        | 'getdata'
        | 'SIMPLETEXT'
        | 'simple_text' = 'quick_reply'
): InteractiveBlock {
    const normalized = type.toUpperCase() as
        | 'GETDATA'
        | 'SIMPLETEXT'
        | 'QUICK_REPLY'
        | 'LIST'

    switch (normalized) {
        case 'QUICK_REPLY':
            return {
                type: 'quick_reply',
                msgid: 'qr_default',
                content: { text: '', type: 'text' },
                options: [],
            }
        case 'LIST':
            return {
                type: 'list',
                body: '',
                globalButtons: [],
                items: [{ title: 'Elija una opción', options: [] }],
            }
        case 'GETDATA':
            return { type: 'GETDATA', prompt: '', description: '' }
        case 'SIMPLETEXT':
            return { type: 'SIMPLETEXT', prompt: '', description: '' }
        default:
            return {
                type: 'quick_reply',
                msgid: 'qr_default',
                content: { text: '', type: 'text' },
                options: [],
            }
    }
}

/**
 * 🏗️ Crea un objeto vacío de tipo GetDataComplete
 * Incluye soporte para descripción extendida.
 */
export function createEmptyGetDataCompleteObject(): GetDataCompleteObject {
    return {
        setvariables: {},
        condition: '',
        groodText: '',
        setvar: '',
        variable: '',
        saveHidden: true,
        alias: '',
        conditions: {},
        iterations: '1',
        timeOut: '60000',
        type: 'quick_reply',
        interactive: createEmptyInteractive('quick_reply') as InteractiveBlock,
        prompt: '',
        description: '',
    }
}

/**
 * 🏗️ Crea un nodo GetDataComplete vacío
 */
export function createEmptyGetDataCompleteNode(
    id: string
): GetDataCompleteNodeFull {
    return {
        id,
        action: 'getdatacomplete',
        isInteractive: true,
        onTrue: '',
        onError: '',
        onFalse: '',
        source: 'GetData',
        interactiveVersion: 6,
        object: createEmptyGetDataCompleteObject(),
        description: '',
    }
}
