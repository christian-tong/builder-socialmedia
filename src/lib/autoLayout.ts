// src\lib\autoLayout.ts

import dagre from 'dagre'
import { type Edge, type Node, Position } from 'reactflow'

/**
 * 📐 applyAutoLayout (v7.8 – CompactFlow Smart Layout)
 * ------------------------------------------------------------------------
 * ✔️ Soporta orientación vertical/horizontal
 * ✔️ Compacta automáticamente según tipo de nodo
 * ✔️ Calcula altura dinámica (opciones, mensajes largos)
 * ✔️ Corrige desplazamientos negativos
 * ✔️ Limita ancho máximo a 380 px
 */
export function applyAutoLayout(
    nodes: Node[],
    edges: Edge[],
    orientation: 'vertical' | 'horizontal'
): Node[] {
    if (!nodes.length) return nodes

    const isHorizontal = orientation === 'horizontal'
    const dagreGraph = new dagre.graphlib.Graph()
    dagreGraph.setDefaultEdgeLabel(() => ({}))

    // 🔧 Configuración compacta base
    const NODE_SEP = 80 // separación entre nodos hermanos
    const RANK_SEP = 120 // separación entre niveles
    const MARGIN = 40

    dagreGraph.setGraph({
        rankdir: isHorizontal ? 'LR' : 'TB',
        align: 'UL',
        nodesep: NODE_SEP,
        ranksep: RANK_SEP,
        marginx: MARGIN,
        marginy: MARGIN,
    })

    // 🧮 Medir dimensiones por tipo de nodo
    nodes.forEach((node) => {
        const t = String(node.type || '').toLowerCase()
        const data: any = node.data || {}
        let width = 180
        let height = 70

        if (t.includes('menu')) {
            // 🧩 Nodos de tipo menú o GetDataComplete
            const optionsCount = Array.isArray(data.options)
                ? data.options.length
                : Object.keys(data?.object?.setvariables || {}).length

            // ⬆️ Altura dinámica según cantidad de opciones
            height = 100 + optionsCount * 22
            // 📏 Limitar altura máxima
            height = Math.min(height, 380)

            width = 300
            if (height > 250) width = 340
            if (height > 330) width = 380
        } else if (t.includes('derivate')) {
            width = 180
            height = 80
        } else if (t.includes('simpletext')) {
            const msg = String(data.message || '').length
            width = Math.min(220 + Math.floor(msg / 80) * 40, 380)
            height = Math.min(80 + Math.floor(msg / 60) * 25, 300)
        } else if (t.includes('condition')) {
            width = 200
            height = 110
        } else if (t.includes('switchcondition')) {
            const conds = Object.keys(data.conditions || {}).length
            width = 250
            height = Math.min(100 + conds * 30, 360)
        } else if (
            t.includes('start') ||
            t.includes('end') ||
            t.includes('hangup')
        ) {
            width = 120
            height = 50
        } else if (t.includes('variables')) {
            const vars = data.variables?.length || 1
            width = 220
            height = Math.min(70 + vars * 25, 300)
        } else if (t.includes('mysql') || t.includes('saverecord')) {
            width = 280
            height = 140
        } else if (t.includes('chatbotia') || t.includes('generate')) {
            width = 300
            height = 160
        }

        // 📏 Respetar ancho máximo 380 px
        width = Math.min(width, 380)

        dagreGraph.setNode(node.id, { width, height })
    })

    // 🔗 Registrar edges
    edges.forEach((edge) => {
        if (edge.source && edge.target)
            dagreGraph.setEdge(edge.source, edge.target)
    })

    // 🧠 Calcular layout
    dagre.layout(dagreGraph)

    // 📍 Asignar posiciones calculadas
    const laidOutNodes = nodes.map((node) => {
        const pos = dagreGraph.node(node.id)
        if (!pos) return node

        const w = pos.width ?? 180
        const h = pos.height ?? 70

        node.targetPosition = isHorizontal ? Position.Left : Position.Top
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

        return {
            ...node,
            position: {
                x: pos.x - w / 2,
                y: pos.y - h / 2,
            },
            data: { ...node.data, __animated: true },
        }
    })

    // 🪄 Ajustar desplazamientos negativos
    const minX = Math.min(...laidOutNodes.map((n) => n.position.x))
    const minY = Math.min(...laidOutNodes.map((n) => n.position.y))
    const offsetX = minX < 0 ? Math.abs(minX) + 20 : 0
    const offsetY = minY < 0 ? Math.abs(minY) + 20 : 0

    // ⚙️ Compactar globalmente (reduce espacio)
    const COMPACT_X = 0.9
    const COMPACT_Y = 0.85

    return laidOutNodes.map((n) => ({
        ...n,
        position: {
            x: (n.position.x + offsetX) * COMPACT_X,
            y: (n.position.y + offsetY) * COMPACT_Y,
        },
    }))
}
