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

    // � Parámetros ajustables (valores por defecto)
    const DEFAULT_NODE_WIDTH = 200
    const DEFAULT_NODE_HEIGHT = 90
    const NODE_SEP = 140 // separación entre nodos del mismo nivel (aumentado)
    const RANK_SEP = 250 // separación entre niveles (aumentado significativamente)

    dagreGraph.setGraph({
        rankdir: isHorizontal ? 'LR' : 'TB', // Left→Right o Top→Bottom
        align: 'UL',
        nodesep: NODE_SEP,
        ranksep: RANK_SEP,
        marginx: 100,
        marginy: 100,
    })

    // 📦 Agregar nodos al grafo
    // Calcular tamaño por nodo en función del tipo y contenido para evitar solapamientos
    nodes.forEach((node) => {
        // Valores por defecto
        let width = DEFAULT_NODE_WIDTH
        let height = DEFAULT_NODE_HEIGHT

        // Tipos específicos: menus suelen ser más anchos y más altos según opciones
        const t = String(node.type || '').toLowerCase()
        const data: any = (node as any).data || {}

        if (t.includes('menu')) {
            // Base mayor para menús
            width = 320
            const optionsCount = Array.isArray(data.options) ? data.options.length : 0
            // Ajustar altura según cantidad de opciones (cada opción ocupa espacio)
            height = Math.max(150, 100 + optionsCount * 25)
        } else if (t.includes('derivate')) {
            width = 240
            height = 100
        } else if (t.includes('simpletext')) {
            width = 260
            height = 90
        } else if (t.includes('timecondition') || t.includes('condition')) {
            width = 240
            height = 110
        } else if (t.includes('end') || t.includes('hangup')) {
            width = 140
            height = 64
        } else if (t.includes('start')) {
            width = 140
            height = 64
        }

        // Clamp tamaños razonables
        width = Math.max(120, Math.min(width, 700))
        height = Math.max(48, Math.min(height, 600))

        dagreGraph.setNode(node.id, {
            width,
            height,
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

        // Ajustar coordenadas (centrado) usando el width/height calculado por Dagre
        const nodeWidth = nodeWithPosition.width || DEFAULT_NODE_WIDTH
        const nodeHeight = nodeWithPosition.height || DEFAULT_NODE_HEIGHT

        const newNode = {
            ...node,
            position: {
                x: nodeWithPosition.x - nodeWidth / 2,
                y: nodeWithPosition.y - nodeHeight / 2,
            },
        }

        return newNode
    })

    // 🪄 Resolver solapamientos residuales: algoritmo iterativo simple
    // Construir boxes con tamaños reportados por Dagre (width/height)
    type Box = { id: string; x: number; y: number; w: number; h: number; type?: string }

    const idToNode = new Map(nodes.map((n) => [n.id, n]))

    const boxes: Box[] = laidOutNodes.map((n) => {
        const info = dagreGraph.node(n.id) || { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT }
        const w = info.width || DEFAULT_NODE_WIDTH
        const h = info.height || DEFAULT_NODE_HEIGHT
        const original = idToNode.get(n.id) as any
        const t = String((original && original.type) || '').toLowerCase()
        return {
            id: n.id,
            x: n.position.x,
            y: n.position.y,
            w,
            h,
            type: t,
        }
    })

    const margin = 16 // espacio extra entre nodos
    const maxIters = 80

    function overlap(a: Box, b: Box) {
        const ax1 = a.x - 0
        const ay1 = a.y - 0
        const ax2 = a.x + a.w
        const ay2 = a.y + a.h

        const bx1 = b.x - 0
        const by1 = b.y - 0
        const bx2 = b.x + b.w
        const by2 = b.y + b.h

        const ox = Math.min(ax2, bx2) - Math.max(ax1, bx1)
        const oy = Math.min(ay2, by2) - Math.max(ay1, by1)
        return { ox, oy }
    }

    // Iterar y separar
    for (let iter = 0; iter < maxIters; iter++) {
        let moved = false
        for (let i = 0; i < boxes.length; i++) {
            for (let j = i + 1; j < boxes.length; j++) {
                const a = boxes[i]
                const b = boxes[j]
                const { ox, oy } = overlap(a, b)
                if (ox > -margin && oy > -margin) {
                    // hay solapamiento o están demasiado cerca; empujar en la dirección mayor
                    let pushX = ox > oy ? (ox + margin) : 0
                    let pushY = oy >= ox ? (oy + margin) : 0

                    // Aumentar empuje si alguno es muy ancho (p.ej. textos)
                    const widthFactor = Math.max(1, Math.max(a.w, b.w) / DEFAULT_NODE_WIDTH)
                    pushX *= widthFactor
                    pushY *= widthFactor

                    // Si ambos son 'simpletext' preferimos empujar horizontalmente más
                    if (a.type?.includes('simpletext') && b.type?.includes('simpletext')) {
                        pushX = Math.max(pushX, pushY * 1.6)
                    }

                    // También, si alguno es menu (muy ancho) priorizar separación horizontal
                    if (a.type?.includes('menu') || b.type?.includes('menu')) {
                        pushX = Math.max(pushX, pushY * 1.2)
                    }

                    if (pushX !== 0 || pushY !== 0) {
                        moved = true
                        // empujar cada uno la mitad en direcciones opuestas
                        const signX = a.x < b.x ? -1 : 1
                        const signY = a.y < b.y ? -1 : 1

                        a.x += signX * -pushX * 0.5
                        b.x += signX * pushX * 0.5

                        a.y += signY * -pushY * 0.5
                        b.y += signY * pushY * 0.5
                    }
                }
            }
        }
        if (!moved) break
    }

    // Aplicar las nuevas posiciones de boxes a laidOutNodes
    const boxMap = new Map(boxes.map((b) => [b.id, b]))
    for (const n of laidOutNodes) {
        const b = boxMap.get(n.id)
        if (b) n.position = { x: b.x, y: b.y }
    }

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

// Nueva función para aplicar un layout vertical a todos los nodos, incluyendo nodos de texto, de manera que no se superpongan
export function applyVerticalLayout(nodes: any[]): any[] {
  const verticalSpacing = 100; // Espacio vertical entre nodos, ajustar según se requiera
  let currentY = 0;
  return nodes.map((node: any) => {
    let newNode = {
      ...node,
      position: {
        ...node.position,
        y: currentY
      }
    };
    // Si el nodo es de tipo 'simpleTextNode', asignar tamaño fijo
    if (newNode.type === 'simpleTextNode') {
      newNode.width = 200; // ancho fijo
      newNode.height = 400; // alto fijo
    }
    currentY += verticalSpacing;
    return newNode;
  });
}
