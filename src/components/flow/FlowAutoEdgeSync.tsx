// src\components\flow\FlowAutoEdgeSync.tsx

'use client'

import { useEffect } from 'react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { createConnectionIfMissingGlobal } from '@/hooks/useNodeConnections'
import type {
    QuickReplyInteractive,
    ListInteractive,
    GetDataCompleteObject,
} from '@/types/getDataComplete'

/**
 * 🧠 FlowAutoEdgeSync (v3.6 — Deferred & Global Handle-Safe)
 * ------------------------------------------------------------------
 * - Sincroniza todos los tipos (QR, List, GETDATA, SIMPLETEXT)
 * - Espera 400 ms post-guardado para asegurar render de handles
 * - Usa createConnectionIfMissingGlobal (garantiza idempotencia)
 */
export function FlowAutoEdgeSync() {
    const { setAfterSaveCallback: setGetData } = useGetDataCompleteBaseStore()
    const { setAfterSaveCallback: setSaveRecord } = useSaveRecordStore()
    const { setAfterSaveCallback: setSwitch } = useSwitchConditionStore()

    // 🟣 GetDataComplete
    useEffect(() => {
        setGetData((nodeId, data) => {
            const obj = data as Partial<GetDataCompleteObject>
            const interactive = obj?.interactive as
                | QuickReplyInteractive
                | ListInteractive
                | undefined
            if (!obj) return
            const type = obj.interactive?.type?.toUpperCase()

            setTimeout(() => {
                // 💬 QUICK_REPLY
                if (interactive?.type === 'quick_reply') {
                    interactive.options?.forEach((opt) => {
                        if (opt.nextNodeId)
                            createConnectionIfMissingGlobal(
                                nodeId,
                                opt.nextNodeId,
                                opt.postbackText
                            )
                    })
                    return
                }

                // 🔵 LIST
                if (interactive?.type === 'list') {
                    interactive.items?.forEach((item) =>
                        item.options?.forEach((opt) => {
                            const nextId = (opt as any).nextNodeId
                            if (nextId)
                                createConnectionIfMissingGlobal(
                                    nodeId,
                                    nextId,
                                    opt.postbackText
                                )
                        })
                    )
                    return
                }

                // 🧾 GETDATA
                if (type === 'GETDATA') {
                    Object.entries(obj.conditions || {}).forEach(
                        ([key, targetId]) => {
                            if (targetId)
                                createConnectionIfMissingGlobal(
                                    nodeId,
                                    targetId as string,
                                    key
                                )
                        }
                    )
                }

                // 🗒️ SIMPLETEXT
                if (type === 'SIMPLETEXT') {
                    Object.keys(obj.setvariables || {}).forEach((k) => {
                        const target = (obj.setvariables as any)[k]
                        if (target)
                            createConnectionIfMissingGlobal(nodeId, target, k)
                    })
                }
            }, 400)
        })
    }, [setGetData])

    // 🟢 SaveRecord
    useEffect(() => {
        setSaveRecord((nodeId, data) => {
            setTimeout(() => {
                if (data.nextNodeId)
                    createConnectionIfMissingGlobal(
                        nodeId,
                        data.nextNodeId,
                        'onSuccess'
                    )
            }, 400)
        })
    }, [setSaveRecord])

    // 🔴 SwitchCondition
    useEffect(() => {
        setSwitch((nodeId, cfg) => {
            setTimeout(() => {
                Object.entries(cfg.connections || {}).forEach(
                    ([val, target]) => {
                        if (target)
                            createConnectionIfMissingGlobal(
                                nodeId,
                                target,
                                `on:${val}`
                            )
                    }
                )
            }, 400)
        })
    }, [setSwitch])

    return null
}
