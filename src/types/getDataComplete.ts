// src\types\getDataComplete.ts

/**
 * 🧠 GetDataComplete Types (v5)
 * ------------------------------------------------------------
 * Define los tipos base, variantes y utilidades para el nodo
 * interactivo `getdatacomplete`, usado dentro de React Flow.
 *
 * Compatible con:
 *  - QuickReply (bloques interactivos tipo botones)
 *  - List (bloques interactivos tipo menú)
 *  - GetData (input directo / selección simple)
 *  - SimpleText (texto plano con lista de opciones)
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
    // 🧩 Nuevos campos opcionales
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

    /**
     * 🔎 Bloque discriminado por `type`
     * Puede ser:
     *  - quick_reply
     *  - list
     *  - GETDATA
     *  - SIMPLETEXT
     */
    type?: 'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT'

    /** 💬 Contenido del bloque según el tipo */
    interactive?: InteractiveBlock
    prompt?: string
}

/* -------------------------------------------------------------------------- */
/* 💬 Bloque interactivo base (discriminado por type)                         */
/* -------------------------------------------------------------------------- */

export type InteractiveBlock =
    | QuickReplyInteractive
    | ListInteractive
    | GetDataInteractive
    | SimpleTextInteractive

/* -------------------------------------------------------------------------- */
/* 🟢 Variante QUICK_REPLY                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* 🔵 Variante LIST                                                           */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* 🟡 Variante GETDATA                                                        */
/* -------------------------------------------------------------------------- */
/**
 * Representa un bloque de entrada directa o selección numérica.
 * Ejemplo: confirmar, autorizar, elegir sector, etc.
 */
export interface GetDataInteractive {
    type: 'GETDATA'
    prompt?: string
}

/* -------------------------------------------------------------------------- */
/* 🟠 Variante SIMPLETEXT                                                     */
/* -------------------------------------------------------------------------- */
/**
 * Representa un mensaje plano con texto largo y opciones numeradas.
 * Ejemplo: “Elija su empresa eléctrica: 1. Luz del Sur, 2. Enel...”
 */
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

export function isSimpleTextInteractive(
    interactive: InteractiveBlock
): interactive is SimpleTextInteractive {
    return interactive.type === 'SIMPLETEXT'
}

/* -------------------------------------------------------------------------- */
/* 🏗️ Factories por defecto (para inicializar formularios o nodos nuevos)     */
/* -------------------------------------------------------------------------- */

export function createEmptyInteractive(
    type: 'quick_reply' | 'list' | 'GETDATA' | 'SIMPLETEXT' = 'quick_reply'
): InteractiveBlock {
    switch (type) {
        case 'quick_reply':
            return {
                type: 'quick_reply',
                msgid: 'qr_default',
                content: { text: '', type: 'text' },
                options: [],
            }
        case 'list':
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
        interactive: createEmptyInteractive('quick_reply'),
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
        interactiveVersion: 5,
        object: createEmptyGetDataCompleteObject(),
    }
}
