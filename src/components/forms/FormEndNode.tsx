// src\components\forms\FormEndNode.tsx

"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useFlowStore } from "@/store/useFlowStore";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🟥 FormEndNode — Configuración del nodo final (Hangup)
 * --------------------------------------------------
 * - Muestra todos los nodos que llegan a este nodo
 * - Permite editar la causa del colgado
 */
export default function FormEndNode({ id, data }: any) {
  const { updateNodeData } = useNodeConfigStore();
  const { getConnectedNodes, edges, nodes } = useFlowStore();
  const [prevNodes, setPrevNodes] = useState<string[]>([]);

  // 🔁 Recalcular lista de nodos anteriores
  useEffect(() => {
    const { prev } = getConnectedNodes(id);
    const labels = prev.map((n) => n.data?.label || n.id);
    setPrevNodes(labels);
  }, [edges, nodes, id]);

  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Nodo Final (Hangup)</Label>
        <Badge
          variant="outline"
          className="text-[10px] px-2 py-0.5 bg-rose-50 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border-rose-300 dark:border-rose-700"
        >
          {id}
        </Badge>
      </div>

      {/* 🧩 Nodos anteriores */}
      <div className="flex flex-col gap-2">
        <Label className="text-sm font-medium">Nodos que llegan aquí</Label>
        {prevNodes.length === 0 ? (
          <p className="text-xs italic text-gray-500">
            Ningún nodo conectado aún
          </p>
        ) : (
          <ul className="text-xs font-mono bg-gray-100 dark:bg-gray-800 p-2 rounded-md border border-gray-200 dark:border-gray-700">
            {prevNodes.map((label, idx) => (
              <li key={idx} className="text-gray-700 dark:text-gray-300">
                • {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
