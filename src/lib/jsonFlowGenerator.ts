// src/lib/jsonFlowGenerator.ts

import type { Edge, Node } from 'reactflow'
import { useMySQLQueryStore } from '@/store/useMySQLQueryStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { useVariablesStore } from '@/store/useVariablesStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'

/**
 * 🔍 getTrueVariantType
 * --------------------------------------------------
 * Detecta el tipo real de nodo (list, quick_reply, GETDATA o SIMPLETEXT)
 */
function getTrueVariantType(base: any): string {
    const possible = [
        base?.interactive?.type,
        base?.object?.interactive?.type,
        base?.object?.type,
        base?.type,
    ]
        .filter(Boolean)
        .map((t) => String(t).toLowerCase())

    if (possible.includes('list')) return 'list'
    if (possible.includes('quick_reply')) return 'quick_reply'
    if (possible.includes('getdata')) return 'getdata'
    if (possible.includes('simpletext') || possible.includes('simple_text'))
        return 'simpletext'

    const hasInteractive =
        base?.interactive || base?.object?.interactive || false
    return hasInteractive ? 'quick_reply' : 'getdata'
}

/**
 * 🧠 generateConversationJson (v7.4.1 – TypeSafe Full WiContact Compatibility)
 * ------------------------------------------------------------------------
 * ✅ TypeScript seguro (sin errores ni advertencias)
 * ✅ Soporta QuickReply, List, GetData, SimpleText
 * ✅ Extrae alias, setvariables, condition, groodText, etc.
 */
export function generateConversationJson(
    nodes: Node<Record<string, any>>[],
    edges: Edge[]
): { process: { steps: any[] } } {
    const steps: any[] = []

    const findTarget = (sourceId: string, handleId?: string): string | null => {
        const match = edges.find(
            (e) =>
                e.source === sourceId &&
                (!handleId || e.sourceHandle === handleId)
        )
        return match?.target ?? null
    }

    // Stores activos
    const mysqlStore = useMySQLQueryStore.getState()
    const saveRecordStore = useSaveRecordStore.getState()
    const switchStore = useSwitchConditionStore.getState()
    const varsStore = useVariablesStore.getState()
    const gdcBaseStore = useGetDataCompleteBaseStore.getState()

    for (const node of nodes) {
        const { id, type, data } = node
        const onTrue = findTarget(id, 'onTrue')
        const onFalse = findTarget(id, 'onFalse')
        const onError = findTarget(id, 'onError')
        const onSuccess = findTarget(id, 'onSuccess')

        let action = ''
        let object: Record<string, any> = {}
        const description = data?.description ?? ''
        const isTemplate = false

        switch (type) {
            /** 🟢 Inicio */
            case 'startNode':
                action = 'startstep'
                object = {}
                break

            /** 🟦 Texto simple */
            case 'simpleTextNode':
                action = 'simpletext'
                object = { text: encodeURIComponent(data?.message ?? '') }
                break

            /** 🧩 Variables */
            case 'variablesNode': {
                const nodeVars = varsStore.getNodeVariables(id)
                const merged = Object.fromEntries(
                    nodeVars
                        .filter((v) => v.key?.trim())
                        .map((v) => [v.key.trim(), v.value])
                )
                action = 'setvariables'
                object = { setvars: JSON.stringify(merged) }
                break
            }

            /** 👤 Set Customer ID */
            case 'setCustomerIDNode': {
                const d = data ?? {}
                action = 'setcustomerid'
                object = d.object ?? {
                    variable: d.variable ?? '',
                    alias: d.alias ?? '',
                }
                break
            }

            /** 🤖 ChatBot IA Request */
            case 'chatBotIARequestNode':
                action = 'chatbotiarequest'
                object = {
                    variable: data?.variable ?? '',
                    url: data?.url ?? '',
                    body: data?.body ?? '{}',
                }
                break

            /** 🧩 MySQL Query */
            case 'mysqlQueryNode': {
                const s = mysqlStore.getNodeData(id)
                action = 'mysqlquery'
                object = {
                    mode: s.mode ?? 'simpletext',
                    setvar: s.setvar ?? '',
                    query: s.query ?? '',
                    variable: s.variable ?? '',
                    alias: s.alias ?? '',
                    script: s.script ?? '',
                }
                break
            }

            /** 💾 Save Record */
            case 'saveRecordNode': {
                const s = saveRecordStore.getNodeData(id)
                action = 'saverecord'
                object = { auth: s.auth, body: s.body }
                break
            }

            /** 🧬 Switch Condition */
            case 'switchConditionNode': {
                const cfg = switchStore.byId[id]
                action = 'switchcondition'
                if (cfg) {
                    const safeSetVars = Object.fromEntries(
                        cfg.setvariables
                            .filter((s) => s.key?.trim() && s.value?.trim())
                            .map((s) => [s.key.trim(), s.value.trim()])
                    )
                    const safeConnections = Object.fromEntries(
                        Object.entries(cfg.connections || {}).filter(
                            ([, t]) => t && t.trim() !== ''
                        )
                    )
                    object = {
                        setvariables: safeSetVars,
                        variable: cfg.variable ?? '',
                        alias: cfg.alias ?? '',
                        conditions: safeConnections,
                        body: cfg.mode ?? 'strict',
                    }
                }
                break
            }

            /** 🔑 Generate Token */
            case 'generateTokenNode':
                action = 'generatetoken'
                object = data?.object ?? {
                    mode: data?.mode ?? 'simpletext',
                    text: data?.text ?? '',
                    body: data?.body ?? '',
                    script: data?.script ?? '',
                }
                break

            /** 🧩 Menu Node (List / QuickReply / GetData / SimpleText) */
            case 'menuNode': {
                const base = gdcBaseStore.getNodeData(id) || {}
                const vt = getTrueVariantType(base).toLowerCase()
                const isInteractive = vt === 'list' || vt === 'quick_reply'

                // Buscar estructura interactiva
                const interactive: any =
                    base.interactive ??
                    base.object?.interactive ??
                    base.object ??
                    {}

                const items: any[] =
                    interactive.options ?? interactive.items?.[0]?.options ?? []

                const baseConditions: Record<string, string> =
                    base.conditions ??
                    base.object?.conditions ??
                    interactive.conditions ??
                    {}

                const setvariables: Record<string, string> = {}
                const conditions: Record<string, string> = {}
                const itemsOptions: any[] = []

                for (const [i, opt] of items.entries()) {
                    const key = String(opt.postbackText || i + 1)
                    const title = decodeURIComponent(opt.title ?? key)
                    const desc = decodeURIComponent(opt.description ?? '')
                    const next = opt.nextNodeId ?? baseConditions[key] ?? ''
                    setvariables[key] = title
                    if (next) conditions[key] = next

                    itemsOptions.push({
                        postbackText: key,
                        type: opt.type ?? 'text',
                        title: encodeURIComponent(title),
                        description: encodeURIComponent(desc),
                        nextNodeId: next,
                    })
                }

                // Generar patrón de condición
                const keys = Object.keys(setvariables)
                let conditionPattern = ''
                if (keys.length > 0) {
                    const numericKeys = keys
                        .map((k) => parseInt(k))
                        .filter((n) => !isNaN(n))
                    conditionPattern =
                        numericKeys.length > 0
                            ? `[${Math.min(...numericKeys)}-${Math.max(
                                  ...numericKeys
                              )}]`
                            : `[${keys.join('|')}]`
                }

                // Base del objeto (para todos los tipos)
                const shared = {
                    source: 'GetData',
                    setvariables: base.setvariables ?? setvariables,
                    variable: base.variable ?? base.object?.variable ?? '',
                    alias: base.alias ?? base.object?.alias ?? '',
                    setvar: base.setvar ?? base.object?.setvar ?? '',
                    condition:
                        base.condition ??
                        base.object?.condition ??
                        conditionPattern,
                    groodText: base.groodText ?? base.object?.groodText ?? '',
                    saveHidden:
                        base.saveHidden ?? base.object?.saveHidden ?? true,
                    conditions,
                    iterations:
                        base.iterations ?? base.object?.iterations ?? '1',
                    timeOut: base.timeOut ?? base.object?.timeOut ?? '60000',
                }

                if (isInteractive) {
                    // Evita error TS: “esta expresión nunca es nula”
                    const msgid: string =
                        (interactive.msgid as string | undefined) ||
                        `qr_${id}` ||
                        'qr_default'

                    const interactiveObj =
                        vt === 'quick_reply'
                            ? {
                                  type: 'quick_reply',
                                  msgid,
                                  content: {
                                      type: interactive.content?.type ?? 'text',
                                      text: encodeURIComponent(
                                          interactive.content?.text ??
                                              base.message ??
                                              data?.message ??
                                              ''
                                      ),
                                  },
                                  options: itemsOptions,
                                  conditions,
                              }
                            : {
                                  type: 'list',
                                  body: encodeURIComponent(
                                      base.message ??
                                          data?.message ??
                                          interactive.body ??
                                          ''
                                  ),
                                  globalButtons: interactive.globalButtons ?? [
                                      { type: 'text', title: 'Elegir' },
                                  ],
                                  items: [
                                      {
                                          title:
                                              interactive.items?.[0]?.title ??
                                              'Elija una opción',
                                          options: itemsOptions,
                                      },
                                  ],
                                  conditions,
                              }

                    object = {
                        ...shared,
                        interactiveVersion: 4,
                        interactive: interactiveObj,
                        type: 'GETDATA',
                    }

                    action = 'getdatacomplete'
                    steps.push({
                        id,
                        source: 'GetData',
                        action,
                        onTrue,
                        onFalse,
                        onError,
                        onSuccess,
                        isInteractive: true,
                        interactiveVersion: 4,
                        isTemplate,
                        description,
                        object,
                    })
                    continue
                }

                // GETDATA / SIMPLETEXT plano
                object = {
                    ...shared,
                    type: vt.toUpperCase(),
                }

                if (base.prompt) object.prompt = encodeURIComponent(base.prompt)
                if (description)
                    object.description = encodeURIComponent(description)

                action = 'getdatacomplete'
                break
            }

            /** 🕓 TimeCondition */
            case 'timeConditionNode':
                action = 'timecondition'
                object = { condition: data?.condition ?? '' }
                break

            /** 🧾 No-op */
            case 'noopNode':
                action = 'noop'
                object = {}
                break

            /** 🟠 Derivate */
            case 'derivateNode':
                action = 'derivate'
                object = {
                    timeoutMessage: encodeURIComponent(
                        data?.timeoutMessage ?? ''
                    ),
                    queueMessage: encodeURIComponent(data?.queueMessage ?? ''),
                    inboundMessage: encodeURIComponent(
                        data?.inboundMessage ?? ''
                    ),
                    skill: data?.skill ?? '',
                }
                break

            /** 🔴 Fin */
            case 'endNode':
                action = 'hangup'
                object = { HangupCause: data?.hangupCause ?? '' }
                break

            default:
                console.warn(`⚠️ Tipo no soportado: ${type} (${id})`)
                continue
        }

        steps.push({
            id,
            action,
            onTrue,
            onFalse,
            onError,
            onSuccess,
            isTemplate,
            description,
            object,
        })
    }

    return { process: { steps } }
}
