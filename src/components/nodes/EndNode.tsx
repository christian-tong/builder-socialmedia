// src\components\nodes\EndNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Power } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";

export default function EndNode({ id, data }: any) {
  const { setSelectedNode } = useNodeConfigStore();
  const { orientation } = useFlowOrientationStore();

  const handlePosition =
    orientation === "vertical" ? Position.Top : Position.Left;

  return (
    <Card
      onClick={() => setSelectedNode({ id, type: "endNode", data })}
      className="px-3 py-2 bg-rose-600 text-white rounded-lg shadow-md border border-rose-700 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="flex items-center gap-2 justify-center">
        <Power className="w-4 h-4" />
        <span className="text-sm font-medium">{data.label || "Fin"}</span>
      </div>

      <Handle
        type="target"
        position={handlePosition}
        className="!bg-rose-400"
      />
    </Card>
  );
}
