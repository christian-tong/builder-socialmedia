// src\components\nodes\SimpleTextNode.tsx
"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";

/**
 * 🟦 SimpleTextNode
 * ----------------------------------------------------
 * - Nodo visual de tipo texto simple
 * - Al hacer clic, abre el formulario asociado (FormSimpleTextNode)
 * - Soporta orientación dinámica (vertical / horizontal)
 * - Datos sincronizados vía Zustand (useNodeConfigStore)
 */
export function SimpleTextNode({ id, data }: any) {
  const { setSelectedNode } = useNodeConfigStore();
  const { orientation } = useFlowOrientationStore();

  // 🔄 Posición dinámica de los handles
  const targetPosition =
    orientation === "vertical" ? Position.Top : Position.Left;
  const sourcePosition =
    orientation === "vertical" ? Position.Bottom : Position.Right;

  return (
    <Card
      onClick={(e) => {
        e.stopPropagation(); // ✅ evita propagación al canvas
        setSelectedNode({ id, type: "simpleTextNode", data });
      }}
      data-id={id}
      className="relative px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-md border border-indigo-700 cursor-pointer hover:scale-[1.02] transition-transform duration-200 select-none"
    >
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-center gap-2 justify-center">
          <MessageSquare className="w-4 h-4" />
          <span className="text-sm font-medium">
            {data.label || "Texto sin título"}
          </span>
        </div>
        {data.message && (
          <p className="text-[10px] opacity-80">{data.message}</p>
        )}
      </div>

      {/* Handles de conexión */}
      <Handle
        type="target"
        position={targetPosition}
        className="!bg-indigo-400"
      />
      <Handle
        type="source"
        position={sourcePosition}
        className="!bg-indigo-400"
      />
    </Card>
  );
}
