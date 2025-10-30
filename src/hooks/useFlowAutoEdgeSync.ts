// src\hooks\useFlowAutoEdgeSync.ts
'use client'

import { useEffect, useRef } from 'react'
import { useFlowStore } from '@/store/useFlowStore'

/**
 * ⚡ useFlowAutoEdgeSync (v4.5 Final — Handle Validation Layer)
 * -------------------------------------------------------------------
 * - Limpia edges con handles inexistentes o nodos removidos
 * - Espera al render de nodos antes de ejecutar
 * - Compatible con FlowAutoEdgeSync (no pisa edges recientes)
 */
export function useFlowAutoEdgeSync() {
    const { nodes, edges, setEdges } = useFlowStore()
    const lastClean = useRef<number>(0)

    useEffect(() => {
        if (nodes.length === 0) return

        const timer = setTimeout(() => {
            const now = Date.now()
            if (now - lastClean.current < 800) return // evita limpieza inmediata doble
            lastClean.current = now

            const validHandles = new Set<string>()
            const nodeIds = new Set(nodes.map((n) => n.id))

            nodes.forEach((n) => {
                const type = n.data?.object?.interactive?.type?.toUpperCase()
                if (!type) return

                if (type === 'QUICK_REPLY')
                    n.data?.object?.interactive?.options?.forEach((o: any) =>
                        validHandles.add(`${n.id}-${o.postbackText}`)
                    )

                if (type === 'LIST')
                    n.data?.object?.interactive?.items?.forEach((item: any) =>
                        item.options?.forEach((o: any) =>
                            validHandles.add(`${n.id}-${o.postbackText}`)
                        )
                    )

                if (type === 'GETDATA')
                    Object.keys(n.data?.object?.conditions || {}).forEach((k) =>
                        validHandles.add(`${n.id}-${k}`)
                    )

                if (type === 'SIMPLETEXT')
                    Object.keys(n.data?.object?.setvariables || {}).forEach(
                        (k) => validHandles.add(`${n.id}-${k}`)
                    )
            })

            const filtered = edges.filter((e) => {
                if (!nodeIds.has(e.source) || !nodeIds.has(e.target))
                    return false
                if (!e.sourceHandle) return true
                return validHandles.has(`${e.source}-${e.sourceHandle}`)
            })

            if (filtered.length !== edges.length) {
                console.warn(
                    `🧹 Limpieza automática: ${edges.length - filtered.length} edges eliminados`
                )
                setEdges(filtered)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [nodes, edges])
}
