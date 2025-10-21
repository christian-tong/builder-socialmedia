// src\lib\flowValidations.ts

import type { Connection, Edge, Node } from 'reactflow'
import { toast } from 'sonner'
import { generateConversationJson } from '@/lib/jsonFlowGenerator'

/**
 * 🧠 validateBeforeExport
 */
export function validateBeforeExport(nodes: Node[]): boolean {
    const hasStart = nodes.some((n) => n.type === 'startNode')
    const hasEnd = nodes.some((n) => n.type === 'endNode')

    if (!hasStart || !hasEnd) {
        toast.error('⚠️ Faltan nodos requeridos', {
            description:
                'Debes tener al menos un nodo de Inicio y un nodo de Fin antes de exportar el flujo.',
        })
        return false
    }
    return true
}

/**
 * 🔌 validateConnection — reglas universales
 */
export function validateConnection(
    connection: Connection,
    nodes: Node[]
): boolean {
    const sourceNode = nodes.find((n) => n.id === connection.source)
    const targetNode = nodes.find((n) => n.id === connection.target)

    if (!sourceNode || !targetNode) return false

    // ⛔ Inicio solo puede tener salidas, no entradas
    if (targetNode.type === 'startNode') {
        toast.warning('Conexión no permitida', {
            description:
                'El nodo de Inicio no puede recibir conexiones entrantes.',
        })
        return false
    }

    // ⛔ Fin solo puede tener entradas, no salidas
    if (sourceNode.type === 'endNode') {
        toast.warning('Conexión no permitida', {
            description: 'El nodo de Fin no puede tener conexiones salientes.',
        })
        return false
    }

    // ⛔ Prevenir conexión startNode → endNode directa
    if (sourceNode.type === 'startNode' && targetNode.type === 'endNode') {
        toast.warning('Conexión no válida', {
            description: 'No puedes conectar directamente Inicio con Fin.',
        })
        return false
    }

    return true
}

/**
 * 🧱 generateValidatedJson
 */
export function generateValidatedJson(nodes: Node[], edges: Edge[]) {
    if (!validateBeforeExport(nodes)) return null
    try {
        return generateConversationJson(nodes, edges)
    } catch (err) {
        console.error('Error generando JSON:', err)
        toast.error('❌ Error al generar el JSON del flujo')
        return null
    }
}
