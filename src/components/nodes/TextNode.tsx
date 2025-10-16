// src\components\nodes\TextNode.tsx

import React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";

export const TextNode = ({ data }: any) => {
    return (
        <Card className="px-3 py-2 bg-slate-800 text-gray-100 rounded-lg shadow-md border border-slate-700 w-40 text-center">
            <Handle type="target" position={Position.Top} className="!bg-indigo-400" />
            <div className="text-sm font-medium">{data.label || "Nodo"}</div>
            <Handle
                type="source"
                position={Position.Bottom}
                className="!bg-indigo-400"
            />
        </Card>
    );
};
