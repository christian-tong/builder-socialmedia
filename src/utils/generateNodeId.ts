// src/utils/generateNodeId.ts

let getdatacompleteCounter = 0
let simpleTextCounter = 0
let derivateCounter = 0
let timeConditionCounter = 0
let endCounter = 0
let switchConditionCounter = 0
let setVariablesCounter = 0
let mysqlQueryCounter = 0
let noopCounter = 0
let chatbotIARequestCounter = 0
let saveRecordCounter = 0
let generateTokenCounter = 0

/** 🟣 Menu Principal */
export function getMenuId(): string {
    const id = `GetDataComplete${String(getdatacompleteCounter).padStart(4, '0')}`
    getdatacompleteCounter++
    return id
}

/** 🟢 SimpleText */
export function generateSimpleTextId(): string {
    const id = `SimpleText${String(simpleTextCounter).padStart(4, '0')}`
    simpleTextCounter++
    return id
}

/** 🟠 Derivate */
export function generateDerivateId(): string {
    const id = `Derivate${String(derivateCounter).padStart(4, '0')}`
    derivateCounter++
    return id
}

/** 🕓 TimeCondition */
export function generateTimeConditionId(): string {
    const id = `TimeCondition${String(timeConditionCounter).padStart(4, '0')}`
    timeConditionCounter++
    return id
}

/** 🟥 EndNode (Hangup) */
export function generateEndId(): string {
    const id = `Hangup${String(endCounter).padStart(4, '0')}`
    endCounter++
    return id
}

/** 🟣 VariablesNode (SetVariables) */
export function generateSetVariablesId(): string {
    const id = `SetVariables${String(setVariablesCounter).padStart(4, '0')}`
    setVariablesCounter++
    return id
}

/** 🔀 SwitchCondition */
export function generateSwitchConditionId(): string {
    const id = `SwitchCondition${String(switchConditionCounter).padStart(4, '0')}`
    switchConditionCounter++
    return id
}

/** 🧠 MySQLQuery */
export function generateMySQLQueryId(): string {
    const id = `MySQLQuery${String(mysqlQueryCounter).padStart(4, '0')}`
    mysqlQueryCounter++
    return id
}

/** 🟤 NoOp (sin operación) */
export function generateNoOpId(): string {
    const id = `NoOp${String(noopCounter).padStart(4, '0')}`
    noopCounter++
    return id
}

/** 🤖 ChatBotIARequest */
export function generateChatBotIARequestId(): string {
    const id = `ChatBotIARequest${String(chatbotIARequestCounter).padStart(4, '0')}`
    chatbotIARequestCounter++
    return id
}

/** 🧾 SaveRecord */
export function generateSaveRecordId(): string {
    const id = `SaveRecord${String(saveRecordCounter).padStart(4, '0')}`
    saveRecordCounter++
    return id
}

/** 🪄 GenerateToken */
export function generateGenerateTokenId(): string {
    const id = `GenerateToken${String(generateTokenCounter).padStart(4, '0')}`
    generateTokenCounter++
    return id
}

/** 🔁 Reset manual */
export function resetNodeCounters() {
    getdatacompleteCounter = 0
    simpleTextCounter = 0
    derivateCounter = 0
    timeConditionCounter = 0
    endCounter = 0
    setVariablesCounter = 0
    switchConditionCounter = 0
    mysqlQueryCounter = 0
    noopCounter = 0
    chatbotIARequestCounter = 0
    saveRecordCounter = 0
    generateTokenCounter = 0
}
