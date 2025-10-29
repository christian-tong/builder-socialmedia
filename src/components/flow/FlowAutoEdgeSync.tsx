// src\components\flow\FlowAutoEdgeSync.tsx

'use client'

import { useEffect } from 'react'
import { useGetDataCompleteBaseStore } from '@/store/GetDataComplete/useGetDataCompleteBaseStore'
import { useSaveRecordStore } from '@/store/useSaveRecordStore'
import { useSwitchConditionStore } from '@/store/useSwitchConditionStore'
import { createConnectionIfMissing } from '@/lib/edgeUtils'
import type {
    QuickReplyInteractive,
    ListInteractive,
} from '@/types/getDataComplete'

/**
 * 🧠 FlowAutoEdgeSync (v3.1 — soporta List)
 * ---------------------------------------------------------------
 * - QuickReply → crea edges por cada opción
 * - List → crea edges por cada item/opción con nextNodeId
 * - SaveRecord / SwitchCondition → igual que antes
 * - Usa createConnectionIfMissing (seguro, idempotente)
 */
export function FlowAutoEdgeSync() {
    const { setAfterSaveCallback: setGetData } = useGetDataCompleteBaseStore()
    const { setAfterSaveCallback: setSaveRecord } = useSaveRecordStore()
    const { setAfterSaveCallback: setSwitch } = useSwitchConditionStore()

    // 🟣 GetDataComplete (QuickReply + List)
    useEffect(() => {
        setGetData((nodeId, data) => {
            const interactive = data.interactive as
                | QuickReplyInteractive
                | ListInteractive
                | undefined

            if (!interactive) return

            // 💬 QUICK_REPLY
            if (interactive.type === 'quick_reply') {
                interactive.options?.forEach((opt) => {
                    if (opt.nextNodeId) {
                        createConnectionIfMissing(
                            nodeId,
                            opt.nextNodeId,
                            opt.postbackText
                        )
                    }
                })
                return
            }

            // 🔵 LIST
            if (interactive.type === 'list') {
                interactive.items?.forEach((item) => {
                    item.options?.forEach((opt) => {
                        const nextId = (opt as any).nextNodeId
                        if (nextId) {
                            createConnectionIfMissing(
                                nodeId,
                                nextId,
                                opt.postbackText
                            )
                        }
                    })
                })
            }
        })
    }, [setGetData])

    // 🟢 SaveRecord → edge onSuccess
    useEffect(() => {
        setSaveRecord((nodeId, data) => {
            if (!data.nextNodeId) return
            createConnectionIfMissing(nodeId, data.nextNodeId, 'onSuccess')
        })
    }, [setSaveRecord])

    // 🔴 SwitchCondition → edges SI / NO / otros
    useEffect(() => {
        setSwitch((nodeId, cfg) => {
            Object.entries(cfg.connections || {}).forEach(([val, target]) => {
                if (target)
                    createConnectionIfMissing(nodeId, target, `on:${val}`)
            })
        })
    }, [setSwitch])

    return null
}
