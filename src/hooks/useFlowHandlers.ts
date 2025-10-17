// src\hooks\useFlowHandlers.ts
"use client";

import { useCallback, useEffect } from "react";
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  EdgeChange,
  NodeChange,
  Connection,
  Node,
} from "reactflow";
import { useReactFlow } from "reactflow";

import { useFlowStore } from "@/store/useFlowStore";
import { useFlowStyleStore } from "@/store/useFlowStyleStore";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";
import { applyAutoLayout } from "@/lib/autoLayout";
import { getNodeTemplate } from "@/config/nodeTemplates";
import { useBeforeUnloadConfirm } from "./useBeforeUnloadConfirm";

/**
 * 🧠 useFlowHandlers — Lógica principal del Flow
 * -------------------------------------------------------
 * - Maneja eventos de nodos, edges y conexiones
 * - Crea nodos dinámicos por drag & drop
 * - Auto layout, actualizaciones globales y confirmaciones
 */
export function useFlowHandlers() {
  const { nodes, edges, setNodes, setEdges } = useFlowStore();
  const { edgeType } = useFlowStyleStore();
  const { orientation } = useFlowOrientationStore();
  const { project, fitView } = useReactFlow();

  useBeforeUnloadConfirm(nodes, edges);

  // 🧠 Crear nodo inicial
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([
        {
          id: "StartNode0000",
          type: "startNode",
          position: { x: 250, y: 100 },
          data: {
            label: "Inicio del flujo",
            message: "Bienvenido al flujo",
          },
        },
      ]);
    }
  }, [nodes, setNodes]);

  // 🔁 Actualizar tipo de edges al cambiar estilo
  useEffect(() => {
    setEdges((eds) => eds.map((e) => ({ ...e, type: edgeType })));
  }, [edgeType, setEdges]);

  // 🧭 Reordenar al cambiar orientación
  useEffect(() => {
    if (nodes.length > 0) {
      const layouted = applyAutoLayout(nodes, edges, orientation);
      setNodes(layouted);
      setTimeout(() => fitView({ padding: 0.2 }), 300);
    }
  }, [orientation]);

  // 🎛️ Handlers
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

  const onConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => addEdge({ ...connection, type: edgeType }, eds)),
    [edgeType, setEdges]
  );

  // 🪄 Drag & Drop
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();

      const type = e.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = (e.target as HTMLElement).getBoundingClientRect();
      const position = project({
        x: e.clientX - bounds.left,
        y: e.clientY - bounds.top,
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

      // 📦 Obtener plantilla del tipo correspondiente
      const { id, data } = getNodeTemplate(type);

      const newNode: Node = {
        id,
        type,
        position: finalPosition,
        data,
      };

      setNodes((prev) => [...prev, newNode]);
    },
    [nodes, setNodes, project]
  );

  return {
    nodes,
    edges,
    handlers: {
      onNodesChange,
      onEdgesChange,
      onConnect,
      onDrop,
      onDragOver,
    },
  };
}
