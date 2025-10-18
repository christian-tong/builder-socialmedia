// src\lib\autoLayout.ts
import dagre from 'dagre'
import { Node, Edge, Position } from 'reactflow'

/**
 * 📐 applyAutoLayout — Distribuye los nodos automáticamente con Dagre
 * --------------------------------------------------------------------
 * - Soporta orientación vertical u horizontal
 * - Mejora separación entre niveles y ramas
 * - Centra nodos con múltiples hijos para evitar solapamientos
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

    // 🔧 Parámetros ajustables
    const NODE_WIDTH = 200
    const NODE_HEIGHT = 90
    const NODE_SEP = 80 // separación entre nodos del mismo nivel
    const RANK_SEP = 140 // separación entre niveles

    dagreGraph.setGraph({
        rankdir: isHorizontal ? 'LR' : 'TB', // Left→Right o Top→Bottom
        align: 'UL',
        nodesep: NODE_SEP,
        ranksep: RANK_SEP,
        marginx: 40,
        marginy: 40,
    })

    // 📦 Agregar nodos al grafo
    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, {
            width: NODE_WIDTH,
            height: NODE_HEIGHT,
        })
    })

    // 🔗 Agregar edges (asegurar que existan ambos extremos)
    edges.forEach((edge) => {
        if (edge.source && edge.target) {
            dagreGraph.setEdge(edge.source, edge.target)
        }
    })

    // ⚙️ Ejecutar layout
    dagre.layout(dagreGraph)

    // 📍 Reasignar posiciones en los nodos
    const laidOutNodes = nodes.map((node) => {
        const nodeWithPosition = dagreGraph.node(node.id)
        if (!nodeWithPosition) return node // evitar errores si falta algún nodo

        // Definir posiciones de conexión
        node.targetPosition = isHorizontal ? Position.Left : Position.Top
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom

        // Ajustar coordenadas (centrado)
        const newNode = {
            ...node,
            position: {
                x: nodeWithPosition.x - NODE_WIDTH / 2,
                y: nodeWithPosition.y - NODE_HEIGHT / 2,
            },
        }

        return newNode
    })

    // 🪄 Normalizar posiciones para evitar offsets negativos
    const minX = Math.min(...laidOutNodes.map((n) => n.position.x))
    const minY = Math.min(...laidOutNodes.map((n) => n.position.y))

    const offsetX = minX < 0 ? Math.abs(minX) + 50 : 0
    const offsetY = minY < 0 ? Math.abs(minY) + 50 : 0

    return laidOutNodes.map((n) => ({
        ...n,
        position: {
            x: n.position.x + offsetX,
            y: n.position.y + offsetY,
        },
    }))
}
