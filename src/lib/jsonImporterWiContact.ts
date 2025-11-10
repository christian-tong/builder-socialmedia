// src\lib\jsonImporterWiContact.ts

import type { Edge, Node } from 'reactflow'
import { useVariantTypeStore } from '@/store/useVariantTypeStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import type {
    GetDataCompleteObject,
    InteractiveBlock,
    QuickReplyInteractive,
    ListInteractive,
    GetDataInteractive,
    SimpleTextInteractive,
} from '@/types/getDataComplete'
import { nodeTypes } from '@/config/nodesConfig'
import { getListSkills } from '@/services/getListSkillsService'
import { applyAutoLayout } from '@/lib/autoLayout'
import { useFlowOrientationStore } from '@/store/useFlowOrientationStore'

/**
 * 🔁 convertWiContactToFlow (v5.6 – VariablesStore Sync)
 * ------------------------------------------------------------------------
 * ✅ Sincroniza VariablesNode con useVariablesStore
 * ✅ Auto-detecta variantes GETDATA / SIMPLETEXT / quick_reply / list
 * ✅ Integra useSaveRecordStore, useVariantTypeStore y useSwitchConditionStore
 * ✅ Evita duplicados de IDs y crea edges válidos y únicos
 * ✅ Soporta importación desde WiContact y osm_wsp.json
 */
export async function convertWiContactToFlow(json: any): Promise<{
    nodes: Node[]
    edges: Edge[]
}> {
    const steps = json?.process?.steps
    if (!Array.isArray(steps))
        throw new Error('JSON inválido: falta process.steps')

    const nodes: Node<any>[] = []
    const edges: Edge<any>[] = []
    const unsupported = new Set<string>()
    const duplicateIds = new Set<string>()
    const uniqueNodeIds = new Set<string>()

    const gdcBaseStore = useGetDataCompleteBaseStore.getState()
    const variantStore = useVariantTypeStore.getState()

    const edgeGlobalUID = () => crypto.randomUUID()

    function safeDecode(value?: string): string {
        if (!value) return ''
        try {
            if (/%[0-9A-Fa-f]{2}/.test(value)) {
                return decodeURIComponent(value)
            }
            return value
        } catch {
            return value
        }
    }

    /** 🔗 Helper seguro para edges */
    const addEdge = (
        source: string,
        target?: string,
        handle?: string,
        label?: string
    ) => {
        if (!target || !source || source === target) return
        const id = `edge-${source}-${handle || 'auto'}-${target}-${edgeGlobalUID()}`
        if (
            edges.some(
                (e) =>
                    e.source === source &&
                    e.target === target &&
                    e.sourceHandle === handle
            )
        )
            return
        edges.push({
            id,
            source,
            target,
            sourceHandle: handle,
            label,
            type: 'smoothstep',
            animated: true,
            style: { strokeWidth: 1.8 },
        })
    }

    console.groupCollapsed('🧩 [Importer v5.6] WiContact / osm_wsp → Flow')
    console.log('Total steps:', steps.length)

    // ========================
    // 🧱 PASADA 1: CREAR NODOS
    // ========================
    for (const step of steps) {
        const { id, action = '', object = {} } = step
        const lower = String(action).toLowerCase()

        if (uniqueNodeIds.has(id)) {
            duplicateIds.add(id)
            continue
        }
        uniqueNodeIds.add(id)

        let nodeType: string | null = null
        let nodeData: any = {}

        switch (lower) {
            case 'startstep':
                nodeType = 'startNode'
                nodeData = { label: id }
                break

            case 'simpletext':
            case 'simple_text':
            case 'simpletextnode':
                nodeType = 'simpleTextNode'
                nodeData = {
                    label: id,
                    message: decodeURIComponent(
                        object.text || object.prompt || ''
                    ),
                }
                break

            case 'derivate': {
                nodeType = 'derivateNode'

                const skillNumber = object.skill ? Number(object.skill) : null
                let skillLabel = ''

                // 🧠 Buscar skillName desde el servicio real (si existe número)
                if (skillNumber) {
                    try {
                        const skillsResponse = await getListSkills()
                        if (skillsResponse.success && skillsResponse.data) {
                            const match = skillsResponse.data.find(
                                (s) => s.skillNumber === skillNumber
                            )
                            if (match) skillLabel = match.skillName
                        }
                    } catch (err) {
                        console.warn('⚠️ No se pudo obtener el skillName:', err)
                    }
                }

                nodeData = {
                    label: id,
                    skill: skillNumber,
                    skillLabel,
                    timeoutMessage: decodeURIComponent(
                        object.timeoutMessage || ''
                    ),
                    queueMessage: decodeURIComponent(object.queueMessage || ''),
                    inboundMessage: decodeURIComponent(
                        object.inboundMessage || ''
                    ),
                }
                break
            }

            case 'timecondition':
                nodeType = 'timeConditionNode'
                nodeData = { label: id, condition: object.condition || '' }
                break

            case 'switchcondition': {
                nodeType = 'switchConditionNode'

                const variable: string = object.variable || ''
                const alias: string = object.alias || ''
                const conditions: Record<string, string> =
                    (object.conditions as Record<string, string>) || {}
                const mode: 'strict' | 'flex' =
                    (object.body as 'strict' | 'flex') || 'strict'

                // 🧠 Cargar el store
                const { byId, initNode } =
                    require('@/store/useSwitchConditionStore').useSwitchConditionStore.getState()

                const storeModule =
                    require('@/store/useSwitchConditionStore').useSwitchConditionStore

                // 🧩 Inicializar base si no existe
                initNode(id)

                // 🚿 Reemplazo completo del nodo (sin SI)
                storeModule.setState((s: any) => ({
                    byId: {
                        ...s.byId,
                        [id]: {
                            variable,
                            alias,
                            mode,
                            // 👇 Sin valor por defecto
                            values: [],
                            connections: {},
                            setvariables: [],
                        },
                    },
                }))

                // ✅ Agregar condiciones desde el JSON
                Object.entries(conditions).forEach(([val, target], index) => {
                    const safeVal = val.trim()
                    if (!safeVal) return

                    storeModule.setState((s: any) => {
                        const cur = s.byId[id]
                        const newValues = [...cur.values, safeVal]
                        const newConnections = {
                            ...cur.connections,
                            [safeVal]: target,
                        }
                        const newSetVars = newValues.map((v, i) => ({
                            key: String(i + 1),
                            value: v,
                        }))
                        return {
                            byId: {
                                ...s.byId,
                                [id]: {
                                    ...cur,
                                    values: newValues,
                                    connections: newConnections,
                                    setvariables: newSetVars,
                                },
                            },
                        }
                    })
                })

                nodeData = {
                    label: id,
                    variable,
                    alias,
                    conditions,
                    body: mode,
                }

                console.log(
                    `🪄 [Importer] SwitchCondition limpio y sincronizado: ${id}`,
                    {
                        variable,
                        alias,
                        conditions,
                    }
                )
                break
            }

            /** 🟣 NUEVO BLOQUE - Sincronización con useVariablesStore */
            case 'setvariables': {
                nodeType = 'variablesNode'

                const variablesStore =
                    require('@/store/useVariablesStore').useVariablesStore.getState()

                let parsed: Record<string, string> = {}
                try {
                    parsed =
                        typeof object.setvars === 'string'
                            ? JSON.parse(object.setvars)
                            : object.setvars || {}
                } catch (err) {
                    console.warn(
                        `⚠️ [Importer] Error parseando setvars en ${id}:`,
                        err
                    )
                    parsed = {}
                }

                const entries = Object.entries(parsed).map(([key, value]) => ({
                    key,
                    value: String(value).toUpperCase(),
                }))
                variablesStore.setNodeVariables(id, entries)

                nodeData = { label: id, variables: entries }
                console.log(
                    `🟣 [Importer] VariablesNode inicializado: ${id}`,
                    parsed
                )
                break
            }

            /** 🧩 GETDATA COMPLETE / MENU / SIMPLETEXT VARIANTS */
            case 'getdatacomplete':
            case 'getdata':
            case 'getdata_v2':
            case 'get_data':
            case 'menu': {
                nodeType = 'menuNode'
                const interactiveIn = object.interactive ?? {}
                const setvars: Record<string, string> =
                    (object.setvariables as Record<string, string>) || {}
                const conditionsRaw: Record<string, string> =
                    (object.conditions as Record<string, string>) || {}

                // 🧠 Normalización para FormGetDataCompleteGetData
                // --------------------------------------------------
                // Si las keys de `conditions` son textos (ej: “DNI”) pero `setvariables` tiene índices (“1”: “DNI”),
                // mapear conditions según los valores de setvariables.
                const normalizedConditions: Record<string, string> = {}
                if (
                    Object.keys(conditionsRaw).length &&
                    Object.keys(setvars).length
                ) {
                    for (const [numKey, val] of Object.entries(setvars)) {
                        const match = Object.entries(conditionsRaw).find(
                            ([condKey]) =>
                                safeDecode(condKey).trim() ===
                                safeDecode(val).trim()
                        )
                        if (match) normalizedConditions[numKey] = match[1]
                    }
                }
                const finalConditions =
                    Object.keys(normalizedConditions).length > 0
                        ? normalizedConditions
                        : conditionsRaw

                // 🔎 Detectar variante de tipo
                type Variant = 'GETDATA' | 'SIMPLETEXT' | 'quick_reply' | 'list'
                const declaredUp = String(object.type || '').toUpperCase()
                let variantType: Variant

                if (declaredUp === 'GETDATA' || declaredUp === 'GET_DATA')
                    variantType = 'GETDATA'
                else if (
                    declaredUp === 'SIMPLETEXT' ||
                    declaredUp === 'SIMPLE_TEXT'
                )
                    variantType = 'SIMPLETEXT'
                else if (
                    interactiveIn.type === 'list' ||
                    Object.keys(setvars).length > 4
                )
                    variantType = 'list'
                else variantType = 'quick_reply'

                // 🧩 Opciones estándar
                const rawOptions =
                    interactiveIn.options ??
                    interactiveIn.items?.[0]?.options ??
                    Object.entries(setvars).map(([key, title]) => ({
                        postbackText: key,
                        title,
                    }))

                const options = (rawOptions || []).map(
                    (opt: any, i: number) => ({
                        postbackText: String(opt?.postbackText ?? i + 1),
                        title: safeDecode(String(opt?.title ?? '')),
                        type: 'text' as const,
                    })
                )

                const prompt = safeDecode(
                    interactiveIn.body ||
                        interactiveIn.content?.text ||
                        object.prompt ||
                        ''
                )
                const description: string = object.description || ''

                let interactive: InteractiveBlock | undefined
                if (variantType === 'quick_reply') {
                    interactive = {
                        type: 'quick_reply',
                        msgid: 'qr_import',
                        content: { text: prompt, type: 'text' },
                        options,
                        conditions: Object.keys(finalConditions).length
                            ? finalConditions
                            : undefined,
                    } as QuickReplyInteractive
                } else if (variantType === 'list') {
                    const items = interactiveIn.items || [
                        {
                            title: 'Elija una opción',
                            options: options.map((o) => ({ ...o })),
                        },
                    ]
                    interactive = {
                        type: 'list',
                        body: prompt,
                        items,
                        globalButtons: interactiveIn.globalButtons || [],
                        conditions: Object.keys(finalConditions).length
                            ? finalConditions
                            : undefined,
                    } as ListInteractive
                } else if (variantType === 'GETDATA') {
                    interactive = {
                        type: 'GETDATA',
                        prompt,
                        description,
                    } as GetDataInteractive
                } else if (variantType === 'SIMPLETEXT') {
                    interactive = {
                        type: 'SIMPLETEXT',
                        prompt,
                        description,
                    } as SimpleTextInteractive
                }

                // 🧱 Objeto completo y sincronización Zustand
                const fullObject: GetDataCompleteObject = {
                    id,
                    action: 'getdatacomplete',
                    alias: object.alias || '',
                    variable: object.variable || '',
                    prompt,
                    setvariables: setvars,
                    conditions: finalConditions,
                    type: variantType,
                    interactive,
                    description,
                    saveHidden: Boolean(object.saveHidden),
                    setvar: object.setvar || '',
                    condition: String(object.condition || ''),
                    iterations: String(object.iterations || '1'),
                    timeOut: String(object.timeOut || '60000'),
                    groodText: object.groodText || '',
                }

                gdcBaseStore.initNode(id)
                gdcBaseStore.setNodeData(id, fullObject)
                nodeData = { label: id, object: fullObject }

                console.log(
                    `🧩 [Importer] ${id} detectado como ${variantType} (GetData Normalize)`
                )
                break
            }

            case 'generatetoken': {
                nodeType = 'generateTokenNode'
                const tokenStore =
                    require('@/store/useGenerateTokenStore').useGenerateTokenStore.getState()
                const mode = object?.mode || 'simpletext'
                const text = object?.text || ''
                const bodyRaw = object?.body || ''
                const script = object?.script || ''
                let bodyObj: Record<string, string> = {}
                try {
                    if (typeof bodyRaw === 'string' && bodyRaw.includes('=')) {
                        bodyRaw.split(',').forEach((pair: string) => {
                            const [key, val] = pair.split('=')
                            if (key && val) bodyObj[key.trim()] = val.trim()
                        })
                    } else if (typeof bodyRaw === 'object') bodyObj = bodyRaw
                } catch (err) {
                    console.warn(
                        `⚠️ [Importer] Error parseando body en ${id}:`,
                        err
                    )
                }
                const fullObject = { mode, text, body: bodyObj, script }
                tokenStore.initNode(id)
                tokenStore.setNodeData(id, fullObject)
                nodeData = { label: id, ...fullObject }
                console.log(
                    `🔑 [Importer] GenerateToken cargado: ${id}`,
                    fullObject
                )
                break
            }

            /** 🧠 SetCustomerID */
            case 'setcustomerid': {
                nodeType = 'setCustomerIDNode'

                // Cargar store Zustand
                const setCustomerIDStore =
                    require('@/store/useSetCustomerIDStore').useSetCustomerIDStore.getState()

                // 🧱 Normalización segura del objeto
                let optionsObj: Record<string, string> = {}
                try {
                    const obj = object || {}

                    // 🔹 Si ya viene como object.options → usarlo directo
                    if (obj?.options && typeof obj.options === 'object') {
                        optionsObj = obj.options
                    } else if (typeof obj === 'object' && !Array.isArray(obj)) {
                        // 🔹 Si viene plano: convertir variable/alias a options
                        if (obj.variable || obj.alias) {
                            optionsObj = {
                                ...(obj.variable
                                    ? { variable: obj.variable }
                                    : {}),
                                ...(obj.alias ? { alias: obj.alias } : {}),
                            }
                        }
                    }

                    // Asegurar que los valores son strings
                    Object.entries(optionsObj).forEach(([k, v]) => {
                        optionsObj[k] = String(v ?? '')
                    })
                } catch (err) {
                    console.warn(
                        `⚠️ [Importer] Error parseando SetCustomerID en ${id}:`,
                        err
                    )
                    optionsObj = {}
                }

                // 🧩 Sincronizar con Zustand
                setCustomerIDStore.initNode(id)
                setCustomerIDStore.setNodeData(id, { options: optionsObj })

                // 🧠 Crear nodo ReactFlow
                nodeData = {
                    label: id,
                    object: {
                        options: optionsObj,
                    },
                }

                console.log(
                    `🧩 [Importer] SetCustomerIDNode inicializado: ${id}`,
                    optionsObj
                )
                break
            }

            case 'chatbotiarequest': {
                nodeType = 'chatBotIARequestNode'

                // 🔹 Cargar store zustand
                const iaStore =
                    require('@/store/useChatBotIAStore').useChatBotIAStore.getState()

                // 🧱 Normalización del objeto
                const variable = object?.variable || ''
                const url = object?.url || ''
                const bodyRaw = object?.body || '{}'
                let bodyParsed = '{}'

                // 🧩 Asegurar que el body sea JSON válido
                try {
                    if (typeof bodyRaw === 'string') {
                        // si viene como string, validar estructura
                        JSON.parse(bodyRaw)
                        bodyParsed = bodyRaw
                    } else if (typeof bodyRaw === 'object') {
                        bodyParsed = JSON.stringify(bodyRaw, null, 2)
                    }
                } catch (err) {
                    console.warn(`⚠️ [Importer] Body corrupto en ${id}`, err)
                    bodyParsed = '{}'
                }

                // 🧠 Sincronizar con store
                iaStore.initNode(id)
                iaStore.setNodeData(id, {
                    variable,
                    url,
                    body: bodyParsed,
                })

                // 🧩 Definir nodo visual
                nodeData = {
                    label: id,
                    variable,
                    url,
                    body: bodyParsed,
                }

                console.log(
                    `🤖 [Importer] ChatBotIARequestNode inicializado: ${id}`,
                    {
                        variable,
                        url,
                        bodyParsed,
                    }
                )
                break
            }

            case 'saverecord': {
                nodeType = 'saveRecordNode'
                const saveRecordStore =
                    require('@/store/useSaveRecordStore').useSaveRecordStore.getState()
                const auth = {
                    headers: object?.auth?.headers || {},
                    vartoken: object?.auth?.vartoken || '',
                    body: object?.auth?.body || '{}',
                    url: object?.auth?.url || '',
                }
                const body = object?.body || '{}'
                const fullObject = {
                    auth,
                    body,
                    nextNodeId: step?.onTrue || undefined,
                }
                saveRecordStore.initNode(id)
                saveRecordStore.setNodeData(id, fullObject)
                nodeData = { label: id, ...fullObject }
                console.log(
                    `💾 [Importer] SaveRecord inicializado: ${id}`,
                    fullObject
                )
                break
            }

            case 'mysqlquery': {
                nodeType = 'mysqlQueryNode'

                const mysqlStore =
                    require('@/store/useMySQLQueryStore').useMySQLQueryStore.getState()

                // 🧩 Normalización
                const mode = object?.mode || 'simpletext'
                const setvar = object?.setvar || ''
                const query = object?.query || ''
                const variable = object?.variable || ''
                const alias = object?.alias || ''
                const script = object?.script || ''

                // 🧱 Objeto completo
                const fullObject = {
                    mode,
                    setvar,
                    query,
                    variable,
                    alias,
                    script,
                }

                // 🧠 Sincronizar en store
                mysqlStore.initNode(id)
                mysqlStore.setNodeData(id, fullObject)

                // 🧩 Data para el nodo visual
                nodeData = {
                    label: id,
                    object: fullObject,
                }

                console.log(
                    `🧩 [Importer] MySQLQueryNode inicializado: ${id}`,
                    fullObject
                )
                break
            }

            case 'noop': {
                nodeType = 'noopNode'

                // 🧩 Descripción opcional
                const description =
                    typeof object?.description === 'string'
                        ? object.description.trim()
                        : step.description?.trim() || ''

                nodeData = {
                    label: id,
                    description: description || 'Nodo sin operación (NoOp)',
                }

                break
            }

            case 'hangup':
                nodeType = 'endNode'
                nodeData = { label: id, hangupCause: object.HangupCause || '' }
                break

            default:
                unsupported.add(lower)
                continue
        }

        if (nodeType && nodeTypes[nodeType]) {
            nodes.push({
                id,
                type: nodeType,
                position: { x: 0, y: 0 },
                data: nodeData,
            })
        } else if (nodeType) unsupported.add(nodeType)
    }

    // ==========================
    // 🔗 PASADA 2: CREAR EDGES (v5.10 Normalize)
    // ==========================
    for (const step of steps) {
        const { id, onTrue, onFalse, onError, object = {}, action = '' } = step
        if (!uniqueNodeIds.has(id)) continue

        const lowerAction = String(action).toLowerCase()

        // 🔗 Conexiones estándar
        addEdge(id, onTrue, 'onTrue')
        addEdge(id, onFalse, 'onFalse')
        addEdge(id, onError, 'onError')
        if ((object as any)?.nextNodeId)
            addEdge(id, (object as any).nextNodeId, 'onSuccess')

        // ==================================================================
        // 🧩 1️⃣ SWITCHCONDITION — Crear edges dinámicos por cada condición + onTrue
        // ==================================================================
        if (lowerAction === 'switchcondition') {
            const switchModule = require('@/store/useSwitchConditionStore')
            const getSwitchHandleId = switchModule.getSwitchHandleId
            const conditions: Record<string, string> =
                (object as any)?.conditions || {}

            // 🟢 Crear edge onTrue (manejo estándar de flujo)
            if (step.onTrue && typeof step.onTrue === 'string') {
                addEdge(id, step.onTrue, 'onTrue', 'trueStep')
                console.log(
                    `🟢 [Importer] onTrue conectado → ${id} → ${step.onTrue}`
                )
            }

            // 🔀 Crear edges dinámicos por cada condición (SI / NO / etc.)
            for (const [condValue, targetId] of Object.entries(conditions)) {
                if (targetId && condValue) {
                    const handleId = getSwitchHandleId(id, condValue)
                    addEdge(id, targetId, handleId, condValue)
                }
            }

            continue
        }

        // ==================================================================
        // 🧩 2️⃣ MENUS / GETDATA / SIMPLETEXT: crea edges por condiciones u opciones (v5.10 Normalize)
        // ==================================================================
        const conditions = (object as any)?.conditions as
            | Record<string, string>
            | undefined
        const setvars = (object as any)?.setvariables as
            | Record<string, string>
            | undefined
        const interactiveType = (object as any)?.interactive?.type as
            | 'quick_reply'
            | 'list'
            | 'GETDATA'
            | 'SIMPLETEXT'
            | undefined
        const declaredTypeUp = String((object as any)?.type || '').toUpperCase()

        // 🧠 Para GETDATA / SIMPLETEXT → normaliza condiciones según las claves de setvariables
        if (
            (declaredTypeUp === 'GETDATA' || declaredTypeUp === 'SIMPLETEXT') &&
            conditions &&
            Object.keys(conditions).length
        ) {
            const normalizedEdges: Record<string, string> = {}
            if (setvars && Object.keys(setvars).length) {
                for (const [numKey, val] of Object.entries(setvars)) {
                    const match = Object.entries(conditions).find(
                        ([condKey]) =>
                            decodeURIComponent(condKey).trim() ===
                            decodeURIComponent(val).trim()
                    )
                    if (match) normalizedEdges[numKey] = match[1]
                }
            }

            const finalEdges =
                Object.keys(normalizedEdges).length > 0
                    ? normalizedEdges
                    : conditions

            for (const [key, targetId] of Object.entries(finalEdges)) {
                addEdge(id, targetId as string, `cond_${key}`)
                console.log(
                    `⚡ [Importer] Edge GETDATA ${id} → ${targetId} (${key})`
                )
            }
        }

        // 🧩 QuickReply / List → comportamiento estándar
        if (
            (interactiveType === 'quick_reply' || interactiveType === 'list') &&
            conditions &&
            Object.keys(conditions).length
        ) {
            const entries = Object.entries(conditions)
            entries.forEach(([key, targetId], index) => {
                if (!targetId) return

                // 🔎 Si la clave es numérica (1, 2, 3...), úsala directamente
                const isNumeric = /^[0-9]+$/.test(key.trim())

                // 🧠 Si no es numérica (ej. "Callao", "Lince"), usa el índice (empezando desde 1)
                const handleIndex = isNumeric ? key.trim() : String(index + 1)

                // 🏗️ Crear edge con enumeración segura
                addEdge(id, targetId as string, `option_${handleIndex}`)
                console.log(
                    `💬 [Importer] Edge ${interactiveType} ${id} → ${targetId} (handle: option_${handleIndex}, original key: ${key})`
                )
            })
        }
    }

    // ==========================
    // 📍 AUTO-LAYOUT COMPACTO DAGRE (v5.8 – Reactivo con orientación)
    // ==========================

    // 🔧 Detectar orientación global (vertical / horizontal)
    const { orientation } = useFlowOrientationStore.getState()

    // 🪄 Aplicar auto-layout inteligente
    try {
        const arrangedNodes = applyAutoLayout(nodes, edges, orientation)

        // 💡 Compactar un poco más reduciendo el ranksep y nodesep en el gráfico
        // (esto se maneja dentro de applyAutoLayout, pero puedes ajustar aquí si lo deseas)
        arrangedNodes.forEach((n) => {
            n.position.x = n.position.x * 0.9 // 10% más juntos horizontalmente
            n.position.y = n.position.y * 0.8 // 20% más juntos verticalmente
        })

        nodes.splice(0, nodes.length, ...arrangedNodes)
        console.log(`📐 AutoLayout aplicado (${orientation})`)
    } catch (err) {
        console.warn('⚠️ AutoLayout falló, usando posiciones por defecto:', err)
        nodes.forEach(
            (n, i) =>
                (n.position = {
                    x: (i % 6) * 240 + 100,
                    y: Math.floor(i / 6) * 160 + 120,
                })
        )
    }

    console.log(
        '✅ Nodos renderizados:',
        nodes.length,
        '| Edges:',
        edges.length
    )
    if (duplicateIds.size > 0)
        console.warn(
            '⚠️ Nodos duplicados omitidos:',
            [...duplicateIds].join(', ')
        )
    if (unsupported.size > 0) {
        console.warn('⚠️ Tipos no soportados:')
        console.table([...unsupported].map((t) => ({ tipo: t })))
    } else console.log('✅ Todos los tipos soportados.')

    console.groupEnd()
    return { nodes, edges }
}
