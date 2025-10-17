// src\components\nodes\TimeConditionNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";

export default function TimeConditionNode({ id, data }: any) {
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
        setSelectedNode({ id, type: "timeConditionNode", data });
      }}
      className="relative px-3 py-2 bg-sky-500 dark:bg-sky-700 text-white rounded-lg shadow-md border border-sky-600 cursor-pointer hover:scale-[1.02] transition-transform duration-200 select-none"
    >
      <div className="flex flex-col items-center gap-1 text-center">
        <div className="flex items-center gap-2 justify-center">
          <Clock className="w-4 h-4" />
          <span className="text-sm font-semibold">
            {data.label || "Condición Horaria"}
          </span>
        </div>
        {data.condition && (
          <p className="text-[10px] opacity-90">{data.condition}</p>
        )}
      </div>

      <Handle type="target" position={targetPosition} className="!bg-sky-300" />
      <Handle type="source" position={sourcePosition} className="!bg-sky-300" />
    </Card>
  );
}
