// src\components\nodes\MenuNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { ListTree } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🟧 MenuNode
 * -------------------------------------------------------------
 * Nodo que representa un menú interactivo dentro del flujo.
 * - Color naranja para distinguirse visualmente
 * - Ícono representativo de árbol de opciones
 * - Clic selecciona el nodo para editar en el panel derecho
 */
export function MenuNode({ id, data }: any) {
  const { setSelectedNode } = useNodeConfigStore();

  return (
    <Card
      onClick={() => setSelectedNode({ id, type: "menuNode", data })}
      className="px-3 py-2 bg-orange-500 text-white rounded-lg shadow-md border border-orange-600 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
    >
      {/* Contenido visual */}
      <div className="flex items-center gap-2 justify-center">
        <ListTree className="w-4 h-4" />
        <span className="text-sm font-medium truncate">
          {data.label || "Menú"}
        </span>
      </div>

      {/* Conectores superior e inferior */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-orange-300"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-orange-300"
      />
    </Card>
  );
}
