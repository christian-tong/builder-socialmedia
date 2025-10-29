/**
 * 🧠 GetDataComplete Types
 * ------------------------------------------------------------
 * Define los tipos base, variantes y utilidades para el nodo
 * interactivo `getdatacomplete`, usado dentro de React Flow.
 * Compatible con QuickReply y List (v4+).
 */

export interface GetDataCompleteNodeFull {
    id: string
    action: 'getdatacomplete'
    isInteractive: boolean
    onTrue: string
    onError: string
    onFalse: string
    source: string
    interactiveVersion: number
    object: GetDataCompleteObject
}

/* -------------------------------------------------------------------------- */
/* 🧱 Objeto principal                                                        */
/* -------------------------------------------------------------------------- */

export interface GetDataCompleteObject {
    setvariables: Record<string, string>
    condition: string
    groodText: string
    setvar: string
    variable: string
    saveHidden: boolean
    interactive: InteractiveBlock
    alias: string
    conditions: Record<string, string>
    iterations: string
    timeOut: string
}

/* -------------------------------------------------------------------------- */
/* 💬 Bloque interactivo base (discriminado por type)                         */
/* -------------------------------------------------------------------------- */

export type InteractiveBlock = QuickReplyInteractive | ListInteractive

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
/* 🧩 Type Guards                                                             */
/* -------------------------------------------------------------------------- */

/** 🔎 Verifica si el bloque es de tipo QuickReply */
export function isQuickReplyInteractive(
    interactive: InteractiveBlock
): interactive is QuickReplyInteractive {
    return interactive.type === 'quick_reply'
}

/** 🔎 Verifica si el bloque es de tipo List */
export function isListInteractive(
    interactive: InteractiveBlock
): interactive is ListInteractive {
    return interactive.type === 'list'
}

/* -------------------------------------------------------------------------- */
/* 🏗️ Factories por defecto (para inicializar formularios o nodos nuevos)     */
/* -------------------------------------------------------------------------- */

/** 🧱 Crea un bloque interactivo vacío según el tipo especificado */
export function createEmptyInteractive(
    type: 'quick_reply' | 'list' = 'quick_reply'
): InteractiveBlock {
    if (type === 'quick_reply') {
        return {
            type: 'quick_reply',
            msgid: 'qr_default',
            content: { text: '', type: 'text' },
            options: [],
        }
    }
    return {
        type: 'list',
        body: '',
        globalButtons: [],
        items: [
            {
                title: 'Elija una opción',
                options: [],
            },
        ],
    }
}

/** 🧱 Crea un objeto GetDataComplete vacío */
export function createEmptyGetDataCompleteObject(): GetDataCompleteObject {
    return {
        setvariables: {},
        condition: '',
        groodText: '',
        setvar: '',
        variable: '',
        saveHidden: true,
        interactive: createEmptyInteractive('quick_reply'),
        alias: '',
        conditions: {},
        iterations: '1',
        timeOut: '60000',
    }
}

/** 🧱 Crea un nodo completo vacío */
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
        interactiveVersion: 4,
        object: createEmptyGetDataCompleteObject(),
    }
}
