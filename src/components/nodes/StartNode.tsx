// src\components\nodes\StartNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { PlayCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

export function StartNode({ id, data }: any) {
  const { setSelectedNode } = useNodeConfigStore();

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
        position={Position.Bottom}
        className="!bg-emerald-400"
      />
    </Card>
  );
}
