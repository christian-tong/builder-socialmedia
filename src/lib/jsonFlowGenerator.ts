// src/lib/jsonFlowGenerator.ts

// src/lib/jsonFlowGenerator.ts
import type { Edge, Node } from 'reactflow'
import { useMySQLQueryStore } from '@/store/useMySQLQueryStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { useVariablesStore } from '@/store/useVariablesStore'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useGenerateTokenStore } from '@/store/useGenerateTokenStore'
import { useChatBotIAStore } from '@/store/useChatBotIAStore'
import { useSetCustomerIDStore } from '@/store/useSetCustomerIDStore'

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
    return base?.interactive || base?.object?.interactive
        ? 'quick_reply'
        : 'getdata'
}

function buildConditionPattern(keys: string[]): string {
    if (!keys.length) return ''
    const numeric = keys
        .map((k) => Number.parseInt(k, 10))
        .filter((n) => !Number.isNaN(n))
    if (numeric.length === keys.length) {
        const min = Math.min(...numeric)
        const max = Math.max(...numeric)
        return `[${min}-${max}]`
    }
    return `[${keys.join('|')}]`
}

/**
 * 🧠 generateConversationJson (v8.3 – InteractiveConditions Strict Edition)
 * -------------------------------------------------------------------------
 * ✅ Reconstruye correctamente los conditions de quick_reply / list
 * ✅ Usa postbackText como key y nextNodeId como valor
 * ✅ source y handles solo para GETDATA/SIMPLETEXT
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
        const onTimeOut = findTarget(id, 'onTimeOut')
        const onTimeOutError = findTarget(id, 'onTimeOutError')

        let action = ''
        let object: Record<string, any> = {}
        const description = data?.description ?? ''
        const isTemplate = false
        let isInteractive = false
        let interactiveVersion: number | undefined
        let keepSource = false

        switch (type) {
            case 'startNode':
                action = 'startstep'
                object = {}
                break

            case 'simpleTextNode':
                action = 'simpletext'
                object = { text: encodeURIComponent(data?.message ?? '') }
                keepSource = true
                break

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
            
            case 'setCustomerIDNode': {
                // 🧠 Obtener desde store persistente
                const custStore = useSetCustomerIDStore.getState()
                const s = custStore.getNodeData(id)

                action = 'setcustomerid'
                object = {
                    options: s.options ?? {}, // ← los pares clave–valor
                }
                break
            }

            case 'chatBotIARequestNode': {
                // 🧠 Obtener desde store persistente
                const chatStore = useChatBotIAStore.getState()
                const s = chatStore.getNodeData(id)

                action = 'chatbotiarequest'
                object = {
                    variable: s.variable ?? data?.variable ?? '',
                    url: s.url ?? data?.url ?? '',
                    body: s.body ?? data?.body ?? '{}',
                    lastRequest: s.lastRequest ?? undefined,
                    lastResponse: s.lastResponse ?? undefined,
                }
                break
            }

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

            case 'saveRecordNode': {
                const s = saveRecordStore.getNodeData(id)
                action = 'saverecord'
                object = { auth: s.auth, body: s.body }
                break
            }

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

            case 'generateTokenNode': {
                const tokenStore = useGenerateTokenStore.getState()
                const s = tokenStore.getNodeData(id)

                action = 'generatetoken'
                object = {
                    mode: s.mode ?? data?.mode ?? 'simpletext',
                    text: s.text ?? data?.text ?? '',
                    body: s.body ?? data?.body ?? '',
                    script: s.script ?? data?.script ?? '',
                }
                break
            }

            /** 🧩 Menu Node (QuickReply/List/GetData/SimpleText) */
            case 'menuNode': {
                const base = gdcBaseStore.getNodeData(id) || {}
                const vt = getTrueVariantType(base).toLowerCase()
                const isQR = vt === 'quick_reply'
                const isList = vt === 'list'
                const isGetData = vt === 'getdata'
                const isSimpleText = vt === 'simpletext'
                isInteractive = isQR || isList

                const interactive: any =
                    base.interactive ?? base.object?.interactive ?? {}
                const options: any[] =
                    interactive.options ?? interactive.items?.[0]?.options ?? []

                const baseSetVars: Record<string, string> =
                    base.setvariables ?? base.object?.setvariables ?? {}
                const setvariables: Record<string, string> = { ...baseSetVars }
                const conditions: Record<string, string> = {}

                // 🧩 Reconstruir desde opciones (QuickReply/List)
                if (isInteractive) {
                    options.forEach((opt, i) => {
                        const key = String(opt.postbackText ?? i + 1)
                        const label = decodeURIComponent(opt.title ?? '')
                        setvariables[key] = label
                        if (opt.nextNodeId) conditions[key] = opt.nextNodeId
                        else if (interactive.conditions?.[key])
                            conditions[key] = interactive.conditions[key]
                    })
                } else {
                    // 🧠 GetData / SimpleText normales
                    Object.entries(
                        base.conditions ?? base.object?.conditions ?? {}
                    ).forEach(([key, value]) => {
                        conditions[key] = value
                    })
                }

                const conditionPattern = buildConditionPattern(
                    Object.keys(setvariables)
                )

                const shared = {
                    setvariables,
                    variable: base.variable ?? base.object?.variable ?? '',
                    alias: base.alias ?? base.object?.alias ?? '',
                    setvar: base.setvar ?? base.object?.setvar ?? '',
                    condition: conditionPattern,
                    groodText: base.groodText ?? base.object?.groodText ?? '',
                    saveHidden:
                        base.saveHidden ?? base.object?.saveHidden ?? true,
                    conditions,
                    iterations: String(
                        base.iterations ?? base.object?.iterations ?? '1'
                    ),
                    timeOut: String(
                        base.timeOut ?? base.object?.timeOut ?? '60000'
                    ),
                }

                if (isInteractive) {
                    const interactiveObj = isQR
                        ? {
                              type: 'quick_reply',
                              msgid: interactive.msgid ?? `qr_${id}`,
                              content: {
                                  type: interactive.content?.type ?? 'text',
                                  text: encodeURIComponent(
                                      interactive.content?.text ??
                                          base.prompt ??
                                          ''
                                  ),
                              },
                              options: options.map((opt, i) => ({
                                  postbackText: String(
                                      opt.postbackText ?? i + 1
                                  ),
                                  type: opt.type ?? 'text',
                                  title: encodeURIComponent(opt.title ?? ''),
                                  description: encodeURIComponent(
                                      opt.description ?? ''
                                  ),
                              })),
                          }
                        : {
                              type: 'list',
                              body: encodeURIComponent(
                                  interactive.body ?? base.prompt ?? ''
                              ),
                              globalButtons: interactive.globalButtons ?? [],
                              items: [
                                  {
                                      title:
                                          interactive.items?.[0]?.title ??
                                          'Elija una opción',
                                      options: options.map((opt, i) => ({
                                          postbackText: String(
                                              opt.postbackText ?? i + 1
                                          ),
                                          type: opt.type ?? 'text',
                                          title: encodeURIComponent(
                                              opt.title ?? ''
                                          ),
                                          description: encodeURIComponent(
                                              opt.description ?? ''
                                          ),
                                      })),
                                  },
                              ],
                          }

                    object = {
                        ...shared,
                        interactiveVersion: 4,
                        interactive: interactiveObj,
                    }
                    action = 'getdatacomplete'
                    interactiveVersion = 4
                    keepSource = true
                } else {
                    object = {
                        ...shared,
                        type: vt.toUpperCase(),
                    }
                    if (base.prompt)
                        object.prompt = encodeURIComponent(base.prompt)
                    if (description)
                        object.description = encodeURIComponent(description)
                    action = 'getdatacomplete'
                    keepSource = true
                }
                break
            }

            case 'timeConditionNode':
                action = 'timecondition'
                object = { condition: data?.condition ?? '' }
                break

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

            case 'endNode':
                action = 'hangup'
                object = { HangupCause: data?.hangupCause ?? '' }
                break

            default:
                continue
        }

        const step: Record<string, any> = {
            onTrue,
            onFalse,
            onError,
            id,
            action,
            object,
            isTemplate,
            description,
        }

        // 🧩 Añadir conexiones solo si aplica

        // 🧠 Solo algunos nodos mantienen source y manejadores extendidos
        if (keepSource) {
            step.source = 'GetData'
            step.onTimeOut = onTimeOut
            step.onTimeOutError = onTimeOutError
        }

        if (isInteractive) step.isInteractive = true
        if (interactiveVersion) step.interactiveVersion = interactiveVersion

        steps.push(step)
    }

    return { process: { steps } }
}
