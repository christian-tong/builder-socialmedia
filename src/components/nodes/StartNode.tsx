// src\components\nodes\StartNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";

export function StartNode({ id, data }: any) {
  const { setSelectedNode } = useNodeConfigStore();
  const { orientation } = useFlowOrientationStore();

  const handlePosition =
    orientation === "vertical" ? Position.Bottom : Position.Right;

  return (
    <Card
      onClick={() => setSelectedNode({ id, type: "startNode", data })}
      className="px-3 py-2 bg-emerald-600 text-white rounded-lg shadow-md border border-emerald-700 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
    >
      <div className="flex items-center gap-2 justify-center">
        <PlayCircle className="w-4 h-4" />
        <span className="text-sm font-medium">{data.label}</span>
      </div>

      <Handle
        type="source"
        position={handlePosition}
        className="!bg-emerald-400"
      />
    </Card>
  );
}
