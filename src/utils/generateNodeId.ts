// src\utils\generateNodeId.ts

let menuPrincipalCounter = 0
let menuSecundarioCounter = 0
let simpleTextCounter = 0
let derivateCounter = 0
let timeConditionCounter = 0
let endCounter = 0

/** 🟣 Menu Principal */
export function generateMenuPrincipalId(): string {
    const id = `GetDataMain${String(menuPrincipalCounter).padStart(4, '0')}`
    menuPrincipalCounter++
    return id
}

/** 🔵 Menu Secundario */
export function generateMenuSecundarioId(): string {
    const id = `GetDataComplete${String(menuSecundarioCounter + 1000).padStart(
        4,
        '0'
    )}`
    menuSecundarioCounter++
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
    menuPrincipalCounter = 0
    menuSecundarioCounter = 0
    simpleTextCounter = 0
    derivateCounter = 0
    timeConditionCounter = 0
    endCounter = 0
}
