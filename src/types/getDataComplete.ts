// src\types\getDataComplete.ts

/**
 * 🧠 GetDataComplete Types (v6.3)
 * ------------------------------------------------------------
 * Compatibilidad extendida: soporta variantes minúsculas y mayúsculas
 * ('GETDATA' | 'getdata' | 'SIMPLETEXT' | 'simple_text')
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
    description?: string
    isTemplate?: boolean
    onTimeOut?: string
    onTimeOutError?: string
}

/* -------------------------------------------------------------------------- */
/* 🧱 Objeto principal                                                        */
/* -------------------------------------------------------------------------- */

export interface GetDataCompleteObject {
    setvariables: Record<string, string>
    condition: string
    groodText?: string
    setvar: string
    variable: string
    saveHidden: boolean
    alias: string
    conditions: Record<string, string>
    iterations: string
    timeOut: string
    /** Compatibilidad minúsculas/mayúsculas */
    type?:
        | 'quick_reply'
        | 'list'
        | 'GETDATA'
        | 'getdata'
        | 'SIMPLETEXT'
        | 'simple_text'

    /** 💬 prompt: usado en SIMPLETEXT o GETDATA */
    prompt?: string

    /** 💬 bloque interactivo (solo quick_reply o list) */
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
}

export interface GetDataInteractive {
    type: 'GETDATA'
    prompt?: string
}

export interface SimpleTextInteractive {
    type: 'SIMPLETEXT'
    prompt: string
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
    // Normaliza a forma interna consistente
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
            return { type: 'GETDATA', prompt: '' }
        case 'SIMPLETEXT':
            return { type: 'SIMPLETEXT', prompt: '' }
        default:
            return {
                type: 'quick_reply',
                msgid: 'qr_default',
                content: { text: '', type: 'text' },
                options: [],
            }
    }
}

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
    }
}

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
    }
}
