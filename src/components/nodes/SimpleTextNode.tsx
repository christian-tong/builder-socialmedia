// src\components\nodes\SimpleTextNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { MessageSquare } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🟦 SimpleTextNode — Nodo de texto simple interactivo
 * ----------------------------------------------------
 * - Al hacer clic abre el panel lateral derecho (NodeConfigSidebar)
 * - Usa Zustand para setSelectedNode (no pasa por FlowCanvas)
 * - Evita re-renders del canvas completo
 */
export function SimpleTextNode({ id, data }: any) {
  const { setSelectedNode } = useNodeConfigStore();

  console.log("Sidebar: estado actual", useNodeConfigStore.getState());

  return (
    <Card
      onClick={(e) => {
        e.stopPropagation(); // ✅ evita que React Flow interprete doble click
        setSelectedNode({ id, type: "simpleTextNode", data });
      }}
      data-id={id}
      className="relative px-3 py-2 bg-indigo-600 text-white rounded-lg shadow-md border border-indigo-700 cursor-pointer hover:scale-[1.02] transition-transform duration-200 select-none"
    >
      <div className="flex items-center gap-2 justify-center">
        <MessageSquare className="w-4 h-4" />
        <span className="text-sm font-medium">{data.label}</span>
      </div>

      {/* Handles de conexión */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-indigo-400"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!bg-indigo-400"
      />
    </Card>
  );
}
