// src\components\nodes\DerivateNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { UserCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";

/**
 * 🟨 DerivateNode
 * ----------------------------------------------------
 * - Nodo de derivación a un skill o asesor
 * - Muestra su label y el skill asociado
 * - Integra con useNodeConfigStore
 */
const DerivateNode = ({ id, data }: any) => {
  const { setSelectedNode } = useNodeConfigStore();
  const { orientation } = useFlowOrientationStore();

  const targetPosition =
    orientation === "vertical" ? Position.Top : Position.Left;
  const sourcePosition =
    orientation === "vertical" ? Position.Bottom : Position.Right;

  return (
    <Card
      onClick={(e) => {
        e.stopPropagation();
        setSelectedNode({ id, type: "derivateNode", data });
      }}
      data-id={id}
      className="relative px-3 py-2 bg-amber-500 dark:bg-amber-700 text-white rounded-lg shadow-md border border-amber-600 cursor-pointer hover:scale-[1.02] transition-transform duration-200 select-none"
    >
      <div className="flex flex-col items-center text-center gap-1">
        <div className="flex items-center gap-2 justify-center">
          <UserCircle2 className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {data.label || "Derivación"}
          </span>
        </div>
        {data.skillLabel && (
          <p className="text-[10px] opacity-90">{data.skillLabel}</p>
        )}
      </div>

      {/* Handles de conexión */}
      <Handle
        type="target"
        position={targetPosition}
        className="!bg-amber-300"
      />
      <Handle
        type="source"
        position={sourcePosition}
        className="!bg-amber-300"
      />
    </Card>
  );
};

export default DerivateNode;
