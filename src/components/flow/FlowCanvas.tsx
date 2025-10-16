// src/components/flow/FlowCanvas.tsx

"use client";

import React, { useCallback, useEffect } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
  Node,
  Edge,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes } from "@/config/nodesConfig";
import FlowSidebar from "./FlowSidebar";
import { useThemeStore } from "@/store/useThemeStore";
import { useFlowStyleStore } from "@/store/useFlowStyleStore";
import { NodeConfigSidebar } from "./NodeConfigSidebar";
import { FlowStylePanel } from "./FlowStylePanel";

export default function FlowCanvas() {
  const { theme } = useThemeStore();
  const { backgroundType, edgeType } = useFlowStyleStore();

  const [nodes, setNodes, onNodesChange] = useNodesState([
    {
      id: "1",
      type: "startNode",
      position: { x: 250, y: 100 },
      data: { label: "Inicio del flujo", message: "Bienvenido al flujo" },
    },
  ]);

  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // 🔗 Cuando se conectan nodos nuevos, usar el tipo actual
  const onConnect = useCallback(
    (connection: any) =>
      setEdges((eds) => addEdge({ ...connection, type: edgeType }, eds)),
    [edgeType, setEdges]
  );

  // 🪄 Efecto que actualiza todos los edges existentes al cambiar el tipo
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge: Edge) => ({
        ...edge,
        type: edgeType,
      }))
    );
  }, [edgeType, setEdges]);

  // 🎯 Drag & Drop de nodos
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const position = { x: event.clientX - 260, y: event.clientY - 60 };
      const newNode: Node = {
        id: `${+new Date()}`,
        type,
        position,
        data: { label: `${type} node`, message: "" },
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  // 🎨 Fondo dinámico
  const bgVariant =
    backgroundType === "dots"
      ? BackgroundVariant.Dots
      : backgroundType === "lines"
      ? BackgroundVariant.Lines
      : BackgroundVariant.Cross;

  return (
    <div className="flex w-full h-full overflow-hidden relative">
      <FlowSidebar />

      <div
        className={`flex-1 h-full transition-colors duration-500 ${
          theme === "dark" ? "bg-[#0d0d0f]" : "bg-[#f7f7f8]"
        }`}
      >
        <ReactFlowProvider>
          <FlowStylePanel />
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            panOnScroll
            zoomOnScroll
            zoomOnPinch
            edgeTypes={{}}
            className="w-full h-full"
          >
            <Background
              variant={bgVariant}
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
            <Controls />
          </ReactFlow>
        </ReactFlowProvider>

        <NodeConfigSidebar />
      </div>
    </div>
  );
}
