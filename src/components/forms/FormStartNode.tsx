// src\components\forms\FormStartNode.tsx

"use client";

import React from "react";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function FormStartNode({ id, data }: any) {
  const { updateNodeData } = useNodeConfigStore();

  return (
    <div className="flex flex-col gap-3">
      <div>
        <Label>Título</Label>
        <Input
          value={data.label || ""}
          onChange={(e) => updateNodeData(id, { label: e.target.value })}
        />
      </div>
      <div>
        <Label>Descripción</Label>
        <Input
          value={data.message || ""}
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
        />
      </div>
    </div>
  );
}
