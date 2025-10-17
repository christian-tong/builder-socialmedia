// src/lib/jsonFlowGenerator.ts

import { Node, Edge } from "reactflow";

/**
 * 🧠 Genera JSON conversacional basado en el flujo actual
 * -------------------------------------------------------
 * Convierte los nodos de React Flow a la estructura
 * final usada por el backend de conversación.
 */
export function generateConversationJson(nodes: Node[], edges: Edge[]) {
  const jsonOutput: any[] = [];

  // Helper para buscar el siguiente nodo conectado
  const getNextNodeId = (sourceId: string) => {
    const edge = edges.find((e) => e.source === sourceId);
    return edge ? edge.target : null;
  };

  for (const node of nodes) {
    const nextId = getNextNodeId(node.id);

    switch (node.type) {
      case "simpleTextNode":
        jsonOutput.push({
          onTrue: nextId || null,
          action: "simpletext",
          id: node.id,
          object: {
            groodText: node.data?.groodText || "",
            text: encodeURIComponent(node.data?.message || ""),
          },
        });
        break;

      case "derivateNode":
        jsonOutput.push({
          onTrue: getNextNodeId(node.id) || null,
          action: "derivate",
          id: node.id,
          object: {
            timeoutMessage: encodeURIComponent(node.data?.timeoutMessage || ""),
            skill: node.data?.skill ? Number(node.data.skill) : 0,
            queueMessage: encodeURIComponent(node.data?.queueMessage || ""),
            inboundMessage: encodeURIComponent(node.data?.inboundMessage || ""),
            groodText_queueMessage: node.data?.groodText_queueMessage || "",
            groodText_inboundMessage: node.data?.groodText_inboundMessage || "",
          },
        });
        break;

      case "timeConditionNode":
        jsonOutput.push({
          onTrue: node.data?.onTrue || null,
          onFalse: node.data?.onFalse || null,
          action: "timecondition",
          id: node.id,
          object: {
            condition: node.data?.condition || "",
          },
        });
        break;

      case "endNode":
        jsonOutput.push({
          action: "hangup",
          id: node.id,
          object: {
            HangupCause: node.data?.hangupCause || "",
          },
        });
        break;

      default:
        // nodos no conversacionales
        break;
    }
  }

  return jsonOutput;
}
