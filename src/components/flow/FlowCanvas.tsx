// src/components/flow/FlowCanvas.tsx

"use client";

import React, { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  NodeChange,
  EdgeChange,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";

import { nodeTypes } from "@/config/nodesConfig";
import FlowSidebar from "./FlowSidebar";
import { useThemeStore } from "@/store/useThemeStore";
import { useFlowStyleStore } from "@/store/useFlowStyleStore";
import { NodeConfigSidebar } from "./NodeConfigSidebar";
import { FlowStylePanel } from "./FlowStylePanel";
import { useFlowStore } from "@/store/useFlowStore";

export default function FlowCanvas() {
  const { theme } = useThemeStore();

  return (
    <div className="flex w-full h-full overflow-hidden relative">
      <FlowSidebar />
      <div
        className={`flex-1 h-full transition-colors duration-500 ${
          theme === "dark" ? "bg-[#0d0d0f]" : "bg-[#f7f7f8]"
        }`}
      >
        <ReactFlowProvider>
          <FlowCanvasInner />
        </ReactFlowProvider>

        <NodeConfigSidebar />
      </div>
    </div>
  );
}

function FlowCanvasInner() {
  const { theme } = useThemeStore();
  const { backgroundType, edgeType } = useFlowStyleStore();
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const { project, fitView } = useReactFlow();

  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isConfirmedLeave, setIsConfirmedLeave] = useState(false);

  // 🧠 Crear nodo inicial si no hay ninguno
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([
        {
          id: "1",
          type: "startNode",
          position: { x: 250, y: 100 },
          data: { label: "Inicio del flujo", message: "Bienvenido al flujo" },
        },
      ]);
    }
  }, [nodes, setNodes]);

  // 🔁 Actualizar tipo de edges al cambiar estilo global
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        type: edgeType,
      }))
    );
  }, [edgeType, setEdges]);

  // 🧩 Eventos controlados de React Flow
  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // 🔗 Conexión entre nodos
  const onConnect = useCallback(
    (connection: any) =>
      setEdges((eds) => addEdge({ ...connection, type: edgeType }, eds)),
    [edgeType, setEdges]
  );

  // 🪄 Drag & Drop
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = (event.target as HTMLElement).getBoundingClientRect();
      const position = project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const COLLISION_RADIUS = 100;
      const OFFSET_X = 180;
      const OFFSET_Y = 120;

      const hasCollision = nodes.some((n) => {
        const dx = Math.abs(n.position.x - position.x);
        const dy = Math.abs(n.position.y - position.y);
        return dx < COLLISION_RADIUS && dy < COLLISION_RADIUS;
      });

      const finalPosition = hasCollision
        ? { x: position.x + OFFSET_X, y: position.y + OFFSET_Y }
        : position;

      const newNode: Node = {
        id: `${Date.now()}`,
        type,
        position: finalPosition,
        data: { label: `${type} node`, message: "" },
      };

      setNodes((nds) => [...nds, newNode]);
    },
    [nodes, setNodes, project]
  );

  // 🎨 Fondo dinámico
  const bgVariant =
    backgroundType === "dots"
      ? BackgroundVariant.Dots
      : backgroundType === "lines"
      ? BackgroundVariant.Lines
      : BackgroundVariant.Cross;

  // 🧭 Autoajuste tras importar
  useEffect(() => {
    if (nodes.length > 1) {
      setTimeout(() => fitView(), 200);
    }
  }, [nodes, fitView]);

  // ⚠️ Mostrar modal visual antes de cerrar / recargar
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isConfirmedLeave) return; // ya aceptó salir
      if (nodes.length > 0 || edges.length > 0) {
        event.preventDefault();
        event.returnValue = ""; // evita cierre inmediato
        setShowLeaveModal(true);
        return "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [nodes, edges, isConfirmedLeave]);

  // ✅ Confirmar salida del modal visual
  const handleConfirmLeave = () => {
    setIsConfirmedLeave(true);
    setShowLeaveModal(false);
    window.location.reload(); // o router.push('/dashboard')
  };

  // ❌ Cancelar salida
  const handleCancelLeave = () => {
    setShowLeaveModal(false);
  };

  return (
    <>
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
            theme === "dark" ? "rgba(17,17,19,0.6)" : "rgba(240,240,240,0.6)"
          }
          className={theme === "dark" ? "!bg-[#111113]" : "!bg-[#f0f0f0]"}
        />
        <Controls />
      </ReactFlow>
    </>
  );
}
