// src\utils\generateNodeId.ts

let getdatacompleteCounter = 0
let simpleTextCounter = 0
let derivateCounter = 0
let timeConditionCounter = 0
let endCounter = 0

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

/** 🔁 Reset manual */
export function resetNodeCounters() {
    getdatacompleteCounter = 0
    simpleTextCounter = 0
    derivateCounter = 0
    timeConditionCounter = 0
    endCounter = 0
}
