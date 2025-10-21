// src\hooks\useBeforeUnloadConfirm.ts

'use client'

import { useEffect } from 'react'
import type { Edge, Node } from 'reactflow'

/**
 * ⚠️ useBeforeUnloadConfirm
 * -------------------------------------------------------
 * - Previene cierre accidental del flujo con cambios
 * - Muestra confirmación visual o nativa
 */
export function useBeforeUnloadConfirm(nodes: Node[], edges: Edge[]) {
    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (nodes.length > 0 || edges.length > 0) {
                event.preventDefault()
                event.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () =>
            window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [nodes, edges])
}
