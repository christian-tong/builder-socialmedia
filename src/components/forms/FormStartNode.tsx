// src\components\forms\FormStartNode.tsx

"use client";

import React from "react";
import {
	NodeConnectionsAccordion,
	NodeSelectionAccordion,
} from "@/components/shared/NodeConnectionsAccordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNodeConnections } from "@/hooks/useNodeConnections";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🟢 FormStartNode
 * --------------------------------------------------
 * - Usa lógica modular de conexiones (useNodeConnections)
 * - Reutiliza acordeones visuales y funcionales
 * - Código más limpio, mantenible y reutilizable
 */
export default function FormStartNode({
	id,
	data,
}: {
	id: string;
	data: Record<string, any>;
}) {
	const { updateNodeData } = useNodeConfigStore();

	// 🧠 Hook centralizado de conexiones
	const {
		prevNodes,
		nextNodes,
		availableNodes,
		hasConnection,
		toggleConnection,
	} = useNodeConnections(id);

	return (
		<div className="flex flex-col gap-5">
			{/* 🏷️ Encabezado */}
			<div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
				<Label className="text-sm font-semibold text-green-600 dark:text-green-300">
					Nodo de Inicio
				</Label>
				<Badge
					variant="outline"
					className="border-green-300 bg-green-50 px-2 py-0.5 text-[10px] text-green-800 dark:border-green-700 dark:bg-green-900/30 dark:text-green-300"
				>
					{id}
				</Badge>
			</div>

			{/* 🔗 Conexiones actuales */}
			<NodeConnectionsAccordion
				title="Nodo siguiente"
				nodesList={nextNodes}
				accentColor="text-green-700 dark:text-green-300"
			/>

			{/* ⚡ Selección interactiva */}
			<NodeSelectionAccordion
				title="Conectar o desconectar nodos"
				availableNodes={availableNodes}
				hasConnection={hasConnection}
				toggleConnection={toggleConnection}
				accentColor="text-green-700 dark:text-green-300"
			/>

			{/* 🧾 Campos editables */}
			<div className="mt-3 flex flex-col gap-2">
				<Label className="text-sm font-medium">Título</Label>
				<Input
					value={data.label || ""}
					onChange={(e) => updateNodeData(id, { label: e.target.value })}
					placeholder="Título del nodo inicial"
					className="text-sm dark:bg-gray-900/50"
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Descripción</Label>
				<Input
					value={data.message || ""}
					onChange={(e) => updateNodeData(id, { message: e.target.value })}
					placeholder="Mensaje inicial del flujo"
					className="text-sm dark:bg-gray-900/50"
				/>
			</div>
		</div>
	);
}
