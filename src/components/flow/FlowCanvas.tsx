// src\components\flow\FlowCanvas.tsx
"use client";

import React, { useCallback } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Node,
} from "reactflow";
import "reactflow/dist/style.css";

import { TextNode } from "../nodes/TextNode";
import FlowSidebar from "./FlowSidebar";
import { useThemeStore } from "@/store/useThemeStore";

const nodeTypes = { text: TextNode };

export default function FlowCanvas() {
  const { theme } = useThemeStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      type: "text",
      position: { x: 250, y: 100 },
      data: { label: "Nodo inicial" },
    },
  ]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (connection: any) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = {
        x: event.clientX - 260,
        y: event.clientY - 60,
      };

      const newNode: Node = {
        id: `${+new Date()}`,
        type,
        position,
        data: { label: `${type} node` },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  return (
    <div className="flex w-full h-full overflow-hidden">
      <FlowSidebar />

      <div
        className={`flex-1 h-full transition-colors duration-500 ${
          theme === "dark" ? "bg-[#0d0d0f]" : "bg-[#f7f7f8]"
        }`}
      >
        <ReactFlowProvider>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
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
                theme === "dark"
                  ? "rgba(17,17,19,0.6)"
                  : "rgba(240,240,240,0.6)"
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
    </div>
  );
}
