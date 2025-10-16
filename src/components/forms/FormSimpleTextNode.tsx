"use client";

import React from "react";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export default function FormSimpleTextNode({ id, data }: any) {
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
        <Label>Mensaje</Label>
        <Input
          value={data.message || ""}
          onChange={(e) => updateNodeData(id, { message: e.target.value })}
        />
      </div>
    </div>
  );
}
