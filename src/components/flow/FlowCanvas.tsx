// src\components\flow\FlowCanvas.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";

import "reactflow/dist/style.css";
import { TextNode } from "../nodes/TextNode";

const nodeTypes = {
  text: TextNode,
};

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      type: "text",
      position: { x: 250, y: 100 },
      data: { label: "Nodo inicial" },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // 🔍 Detectar cambio global de tema (dark/light)
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setTheme(
        document.documentElement.classList.contains("dark") ? "dark" : "light"
      );
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  const onConnect = useCallback(
    (connection: any) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  return (
    <div
      className={`w-full h-full overflow-hidden transition-colors duration-500 ${
        theme === "dark" ? "bg-[#0d0d0f]" : "bg-[#f7f7f8]"
      }`}
    >
      {/* 🧠 ReactFlowProvider envuelve el lienzo */}
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          panOnScroll
          zoomOnScroll
          zoomOnPinch
          attributionPosition="bottom-left"
          className="w-full h-full"
        >
          <Background
            variant="dots"
            gap={12}
            size={1}
            color={theme === "dark" ? "#333" : "#bbb"}
          />

          <MiniMap
            position="bottom-left"
            nodeColor={() => (theme === "dark" ? "#6366f1" : "#3b82f6")}
            maskColor={
              theme === "dark" ? "rgba(17,17,19,0.6)" : "rgba(240,240,240,0.6)"
            }
            className={theme === "dark" ? "!bg-[#111113]" : "!bg-[#f0f0f0]"}
          />

          <Controls
            position="bottom-right"
            style={{
              background: theme === "dark" ? "#1f1f21" : "#ffffff",
              border: `1px solid ${theme === "dark" ? "#333" : "#ddd"}`,
              borderRadius: 8,
              boxShadow:
                theme === "dark"
                  ? "0 0 8px rgba(255,255,255,0.05)"
                  : "0 0 8px rgba(0,0,0,0.1)",
            }}
          />
        </ReactFlow>
      </ReactFlowProvider>
    </div>
  );
}
