// src\components\nodes\TextNode.tsx

"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/hooks/useTheme";

export const TextNode = ({ data }: any) => {
  const { isDark } = useTheme();

  return (
    <Card
      className={`px-3 py-2 rounded-lg shadow-md border w-40 text-center transition-colors duration-300 ${
        isDark
          ? "bg-slate-800 text-gray-100 border-slate-700"
          : "bg-white text-gray-900 border-gray-300"
      }`}
    >
      {/* 🔹 Entrada */}
      <Handle
        type="target"
        position={Position.Top}
        className={`!bg-indigo-400 ${
          isDark ? "!border-slate-700" : "!border-gray-300"
        }`}
      />

      {/* 🔸 Contenido */}
      <div className="text-sm font-medium select-none">
        {data.label || "Nodo"}
      </div>

      {/* 🔹 Salida */}
      <Handle
        type="source"
        position={Position.Bottom}
        className={`!bg-indigo-400 ${
          isDark ? "!border-slate-700" : "!border-gray-300"
        }`}
      />
    </Card>
  );
};
