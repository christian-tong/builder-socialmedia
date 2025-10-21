// src\components\shared\NodeConnectionsAccordion.tsx
"use client";

import { ChevronDown } from "lucide-react";
import React from "react";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface NodeConnectionsAccordionProps {
	title: string;
	nodesList: string[];
	accentColor?: string;
}

interface NodeSelectionAccordionProps {
	title: string;
	availableNodes: any[];
	hasConnection: (id: string, handleId?: string) => boolean;
	toggleConnection: (id: string, checked: boolean, handleId?: string) => void;
	accentColor?: string;
	/** 🆕 Opcional: para conexiones específicas tipo onTrue/onFalse/onError */
	handleId?: string;
}

/**
 * 📂 NodeConnectionsAccordion
 * ------------------------------------------------
 * Acordeón de solo lectura (para nodos previos o siguientes)
 */
export function NodeConnectionsAccordion({
	title,
	nodesList,
	accentColor = "text-gray-700 dark:text-gray-300",
}: NodeConnectionsAccordionProps) {
	const visible = nodesList.slice(0, 1);
	const hidden = nodesList.slice(1);

	return (
		<div className="flex flex-col gap-2">
			<Label className={`text-sm font-medium ${accentColor}`}>{title}</Label>

			{nodesList.length === 0 ? (
				<p className="text-xs text-gray-500 italic">Ninguno conectado</p>
			) : (
				<Accordion type="single" collapsible className="w-full">
					<AccordionItem value="list">
						<AccordionTrigger className="flex justify-between rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
							{visible[0]}
							{hidden.length > 0 && (
								<span className="flex items-center gap-1 text-[10px] opacity-70">
									+{hidden.length} más
									<ChevronDown className="h-3 w-3" />
								</span>
							)}
						</AccordionTrigger>
						{hidden.length > 0 && (
							<AccordionContent className="mt-1 space-y-1 rounded-md bg-gray-50 px-3 py-2 font-mono text-xs dark:bg-gray-900">
								{hidden.map((n, i) => (
									<div
										key={i}
										className="rounded px-2 py-1 transition hover:bg-gray-200 dark:hover:bg-gray-800"
									>
										{n}
									</div>
								))}
							</AccordionContent>
						)}
					</AccordionItem>
				</Accordion>
			)}
		</div>
	);
}

/**
 * 🧩 NodeSelectionAccordion
 * ------------------------------------------------
 * Acordeón interactivo para conectar o desconectar nodos
 * - Ahora soporta `handleId` (para onTrue, onFalse, onError)
 */
export function NodeSelectionAccordion({
	title,
	availableNodes,
	hasConnection,
	toggleConnection,
	accentColor = "text-gray-700 dark:text-gray-300",
	handleId,
}: NodeSelectionAccordionProps) {
	return (
		<div className="flex flex-col gap-2">
			<Label className={`text-sm font-medium ${accentColor}`}>{title}</Label>

			<Accordion type="single" collapsible className="w-full">
				<AccordionItem value="available">
					<AccordionTrigger className="flex justify-between rounded-md bg-gray-100 px-3 py-2 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
						Nodos disponibles ({availableNodes.length})
						<ChevronDown className="h-3 w-3 opacity-70" />
					</AccordionTrigger>
					<AccordionContent className="mt-1 rounded-md bg-gray-50 px-3 py-2 text-xs dark:bg-gray-900">
						{availableNodes.length === 0 ? (
							<p className="text-xs text-gray-500 italic">No hay otros nodos</p>
						) : (
							<div className="max-h-[220px] space-y-1 overflow-y-auto">
								{availableNodes.map((node) => {
									const connected = hasConnection(node.id, handleId);
									return (
										<div
											key={node.id}
											className={`flex items-center justify-between rounded px-2 py-1 transition ${
												connected
													? "bg-green-50 dark:bg-green-900/20"
													: "hover:bg-gray-200 dark:hover:bg-gray-800"
											}`}
										>
											<div className="flex items-center gap-2">
												<Checkbox
													id={`check-${node.id}`}
													checked={connected}
													onCheckedChange={(checked) =>
														toggleConnection(
															node.id,
															Boolean(checked),
															handleId,
														)
													}
												/>
												<label
													htmlFor={`check-${node.id}`}
													className="cursor-pointer text-xs"
												>
													{node.data?.label || node.id}
												</label>
											</div>
											<Badge
												variant="outline"
												className="px-1 py-0.5 text-[9px] text-gray-600 dark:text-gray-300"
											>
												{node.type}
											</Badge>
										</div>
									);
								})}
							</div>
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
