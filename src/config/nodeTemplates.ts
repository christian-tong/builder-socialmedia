// src/config/nodeTemplates.ts

import {
    generateDerivateId,
    generateEndId,
    getMenuId,
    generateSimpleTextId,
    generateTimeConditionId,
    generateSetVariablesId, // 🟣 nuevo import
} from '@/utils/generateNodeId'

/**
 * 📦 nodeTemplates
 * ------------------------------------------------------
 * Plantillas base reutilizables para cada tipo de nodo.
 * Cada template genera su propio ID y data mínima requerida.
 */
export const nodeTemplates: Record<
    string,
    () => { id: string; data: Record<string, any> }
> = {
    /** 🟩 SimpleText */
    simpleTextNode: () => {
        const id = generateSimpleTextId()
        return {
            id,
            data: {
                label: id,
                message: '',
            },
        }
    },

    /** 🟣 Menú Principal */
    menuNode: () => {
        const id = getMenuId()
        return {
            id,
            data: {
                label: id,
                message: '',
                variable: '',
                options: [{ postbackText: '1', title: 'Opción 1', next: '' }],
            },
        }
    },

    /** 🟠 Derivate */
    derivateNode: () => {
        const id = generateDerivateId()
        return {
            id,
            data: {
                label: id,
                skill: '',
                skillLabel: '',
                timeoutMessage: '',
                queueMessage: '',
                inboundMessage: '',
                groodText_queueMessage: '',
                groodText_inboundMessage: '',
            },
        }
    },

    /** 🕓 TimeCondition */
    timeConditionNode: () => {
        const id = generateTimeConditionId()
        return {
            id,
            data: {
                label: id,
                condition: '',
                dayStart: '',
                dayEnd: '',
                startTime: '',
                endTime: '',
            },
        }
    },

    /** 🟥 EndNode (Hangup) */
    endNode: () => {
        const id = generateEndId()
        return {
            id,
            data: {
                label: id,
                hangupCause: '',
            },
        }
    },

    /** 🟣 VariablesNode (SetVariables) */
    variablesNode: () => {
        const id = generateSetVariablesId()
        return {
            id,
            data: {
                label: id,
                action: 'setvariables',
                object: {
                    setvars: '{}', // inicialmente vacío
                },
            },
        }
    },
}

/** 🔍 Fallback */
export function getNodeTemplate(type: string) {
    const templateFn = nodeTemplates[type]
    if (templateFn) return templateFn()
    const id = `${type}_${Date.now()}`
    return { id, data: { label: id } }
}
