// src/config/nodeTemplates.ts

// src/config/nodeTemplates.ts
import {
    generateDerivateId,
    generateEndId,
    getMenuId,
    generateSimpleTextId,
    generateTimeConditionId,
    generateSetVariablesId,
    generateSwitchConditionId,
    generateMySQLQueryId,
    generateNoOpId,
    generateChatBotIARequestId,
    generateSaveRecordId,
    generateGenerateTokenId,
    generateSetCustomerIDId,
    generateStartNodeId,
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
    /** 🟢 StartNode (Paso Inicial) */
    startNode: () => {
        const id = generateStartNodeId()
        return {
            id,
            data: {
                label: id,
                action: 'startstep',
                object: {},
                onTrue: '', // conexión inicial hacia el siguiente nodo
            },
        }
    },

    /** 🟢 SimpleText */
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

    /** 🧠 SetCustomerIDNode */
    setCustomerIDNode: () => {
        const id = generateSetCustomerIDId()
        return {
            id,
            data: {
                label: id,
                action: 'setcustomerid',
                object: {
                    variable: '',
                    alias: '',
                },
                onTrue: '',
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
                    setvars: '{}',
                },
            },
        }
    },

    /** 🧩 SwitchConditionNode */
    switchConditionNode: () => {
        const id = generateSwitchConditionId()
        return {
            id,
            data: {
                label: id,
                action: 'switchcondition',
                object: {
                    setvariables: { '1': '' },
                    variable: '',
                    alias: '',
                    conditions: { '': '' },
                    body: 'strict',
                },
            },
        }
    },

    /** 🧠 MySQLQueryNode */
    mysqlQueryNode: () => {
        const id = generateMySQLQueryId()
        return {
            id,
            data: {
                label: id,
                action: 'mysqlquery',
                object: {
                    mode: 'simpletext',
                    setvar: '',
                    query: '',
                    variable: '',
                    alias: '',
                    script: '',
                },
            },
        }
    },

    /** 🟤 NoOpNode (sin operación) */
    noopNode: () => {
        const id = generateNoOpId()
        return {
            id,
            data: {
                label: id,
                action: 'noop',
                object: {},
            },
        }
    },

    /** 🤖 ChatBotIARequestNode */
    chatBotIARequestNode: () => {
        const id = generateChatBotIARequestId()
        return {
            id,
            data: {
                label: id,
                action: 'chatbotiarequest',
                object: {
                    variable: '',
                    body: '',
                    url: '',
                },
                onTrue: '',
                onFalse: '',
            },
        }
    },

    /** 🧾 SaveRecordNode */
    saveRecordNode: () => {
        const id = generateSaveRecordId()
        return {
            id,
            data: {
                label: id,
                action: 'saverecord',
                onTrue: '',
                onFalse: '',
                object: {
                    auth: {
                        headers: {},
                        vartoken: '',
                        body: '',
                        url: '',
                    },
                    body: '',
                },
            },
        }
    },

    /** 🪄 GenerateTokenNode */
    generateTokenNode: () => {
        const id = generateGenerateTokenId()
        return {
            id,
            data: {
                label: id,
                action: 'generatetoken',
                onTrue: '',
                object: {
                    mode: 'simpletext', // Select expandible
                    text: 'Clic aquí', // Input simple
                    body: {}, // Key-Value dinámico
                    script: '', // Textarea largo
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
