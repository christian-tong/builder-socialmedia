// src\components\forms\FormTimeConditionNode.tsx

"use client";

import React, { useEffect } from "react";
import {
	NodeConnectionsAccordion,
	NodeSelectionAccordion,
} from "@/components/shared/NodeConnectionsAccordion";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useNodeConnections } from "@/hooks/useNodeConnections";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🕓 Días válidos ISO cortos
 */
const DAYS = [
	{ value: "mon", label: "Lunes" },
	{ value: "tue", label: "Martes" },
	{ value: "wed", label: "Miércoles" },
	{ value: "thu", label: "Jueves" },
	{ value: "fri", label: "Viernes" },
	{ value: "sat", label: "Sábado" },
	{ value: "sun", label: "Domingo" },
];

/**
 * 🕓 FormTimeConditionNode
 * --------------------------------------------------
 * - Define días y horas de condición
 * - Usa lógica modular de conexiones
 * - Mismo estilo que el resto de formularios
 */
export default function FormTimeConditionNode({
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

	// 🧩 Genera la condición automática (ej: mon-fri,09:00-18:00)
	useEffect(() => {
		if (data.dayStart && data.dayEnd && data.startTime && data.endTime) {
			const condition = `${data.dayStart}-${data.dayEnd},${data.startTime}-${data.endTime}`;
			updateNodeData(id, { condition });
		}
	}, [
		data.dayStart,
		data.dayEnd,
		data.startTime,
		data.endTime,
		id,
		updateNodeData,
	]);

	return (
		<div className="flex flex-col gap-5">
			{/* 🔹 Encabezado */}
			<div className="flex items-center justify-between border-b pb-2 dark:border-gray-800">
				<Label className="text-sm font-semibold text-sky-600 dark:text-sky-300">
					Condición de Tiempo
				</Label>
				<Badge
					variant="outline"
					className="border-sky-300 bg-sky-50 px-2 py-0.5 text-[10px] text-sky-800 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300"
				>
					{id}
				</Badge>
			</div>

			{/* 🔗 Acordeones de conexiones */}
			<div className="flex flex-col gap-3">
				<NodeConnectionsAccordion
					title="Nodo anterior"
					nodesList={prevNodes}
					accentColor="text-sky-700 dark:text-sky-300"
				/>
				<NodeConnectionsAccordion
					title="Nodo siguiente"
					nodesList={nextNodes}
					accentColor="text-sky-700 dark:text-sky-300"
				/>
			</div>

			{/* ⚡ Conectar o desconectar nodos */}
			<NodeSelectionAccordion
				title="Conectar o desconectar nodos"
				availableNodes={availableNodes}
				hasConnection={hasConnection}
				toggleConnection={toggleConnection}
				accentColor="text-sky-700 dark:text-sky-300"
			/>

			{/* 🔹 Rango de días */}
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Rango de días</Label>
				<div className="flex items-center gap-2">
					<Select
						value={data.dayStart || ""}
						onValueChange={(val) => updateNodeData(id, { dayStart: val })}
					>
						<SelectTrigger className="w-full dark:bg-gray-900/50">
							<SelectValue placeholder="Día inicio" />
						</SelectTrigger>
						<SelectContent>
							{DAYS.map((d) => (
								<SelectItem key={d.value} value={d.value}>
									{d.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					<span className="text-xs text-gray-500">a</span>

					<Select
						value={data.dayEnd || ""}
						onValueChange={(val) => updateNodeData(id, { dayEnd: val })}
					>
						<SelectTrigger className="w-full dark:bg-gray-900/50">
							<SelectValue placeholder="Día fin" />
						</SelectTrigger>
						<SelectContent>
							{DAYS.map((d) => (
								<SelectItem key={d.value} value={d.value}>
									{d.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* 🔹 Horario */}
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Horario (formato 24 h)</Label>
				<div className="flex items-center justify-between gap-2">
					<div className="flex-1">
						<Label className="text-xs text-gray-500 dark:text-gray-400">
							Desde
						</Label>
						<Input
							type="time"
							value={data.startTime || ""}
							onChange={(e) =>
								updateNodeData(id, {
									startTime: e.target.value,
								})
							}
							className="mt-1 text-sm dark:bg-gray-900/50"
						/>
					</div>
					<div className="flex-1">
						<Label className="text-xs text-gray-500 dark:text-gray-400">
							Hasta
						</Label>
						<Input
							type="time"
							value={data.endTime || ""}
							onChange={(e) => updateNodeData(id, { endTime: e.target.value })}
							className="mt-1 text-sm dark:bg-gray-900/50"
						/>
					</div>
				</div>
			</div>

			{/* 🔹 Resultado */}
			<div className="flex flex-col gap-2">
				<Label className="text-sm font-medium">Condición generada</Label>
				<Input
					value={data.condition || ""}
					readOnly
					className="bg-gray-100 font-mono text-xs dark:bg-gray-800"
				/>
			</div>
		</div>
	);
}
