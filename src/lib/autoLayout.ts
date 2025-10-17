// src\lib\autoLayout.ts

import dagre from "dagre";
import { Node, Edge, Position } from "reactflow";

/**
 * Aplica un layout automático a los nodos según la orientación.
 * @param nodes Lista de nodos actuales
 * @param edges Lista de edges actuales
 * @param orientation "vertical" | "horizontal"
 * @returns Lista de nodos con posiciones ajustadas
 */
export function applyAutoLayout(
  nodes: Node[],
  edges: Edge[],
  orientation: "vertical" | "horizontal"
): Node[] {
  const isHorizontal = orientation === "horizontal";
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const NODE_WIDTH = 180;
  const NODE_HEIGHT = 80;

  dagreGraph.setGraph({
    rankdir: isHorizontal ? "LR" : "TB", // Left→Right o Top→Bottom
    align: "UL",
    nodesep: 60,
    ranksep: 120,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    return {
      ...node,
      position: {
        x: nodeWithPosition.x - NODE_WIDTH / 2,
        y: nodeWithPosition.y - NODE_HEIGHT / 2,
      },
    };
  });
}
