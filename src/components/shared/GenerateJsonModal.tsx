// src\components\shared\GenerateJsonModal.tsx
"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/hooks/useTheme";
import { generateConversationJson } from "@/lib/jsonFlowGenerator";
import { cn } from "@/lib/utils";
import { useFlowStore } from "@/store/useFlowStore";

/**
 * 🧩 GenerateJsonModal — Modal para generar y copiar JSON conversacional
 * --------------------------------------------------------------------
 * - Genera JSON procesado (no formato ReactFlow)
 * - Copiable al portapapeles
 * - Altura máxima 60vh con scroll interno
 */
export function GenerateJsonModal({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const { isDark } = useTheme();
	const { nodes, edges } = useFlowStore();
	const [jsonText, setJsonText] = useState<string>("");

	/** 🧠 Genera el JSON automáticamente al abrir el modal */
	useEffect(() => {
		if (open && nodes.length > 0) {
			try {
				const json = generateConversationJson(nodes, edges);
				const jsonStr = JSON.stringify(json, null, 2);
				setJsonText(jsonStr);
			} catch (err) {
				console.error("Error generando JSON:", err);
				toast.error("❌ Error al generar el JSON del flujo");
			}
		}
	}, [open, nodes, edges]);

	/** 📋 Copiar JSON al portapapeles */
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(jsonText);
			toast.success("✅ JSON copiado al portapapeles", {
				description: "Ya puedes pegarlo en tu editor o Postman.",
			});
			onOpenChange(false);
		} catch (error) {
			toast.error("❌ Error al copiar JSON");
		}
	};

	/** 🔁 Regenerar JSON manualmente */
	const handleRegenerate = () => {
		const json = generateConversationJson(nodes, edges);
		setJsonText(JSON.stringify(json, null, 2));
		toast.info("🔄 JSON actualizado");
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className={cn(
					// 🔹 Estilos principales del modal
					"flex max-h-[60vh] flex-col transition-colors sm:max-w-[900px]",
					isDark
						? "border-gray-800 bg-[#141416] text-gray-200"
						: "border-gray-200 bg-white text-gray-800",
				)}
			>
				<DialogHeader className="shrink-0">
					<DialogTitle className="text-lg font-semibold">
						Generar JSON Conversacional
					</DialogTitle>
				</DialogHeader>

				{/* Contenedor del Textarea con scroll */}
				<div className="flex-1 overflow-auto">
					<Textarea
						value={jsonText}
						onChange={(e) => setJsonText(e.target.value)}
						className={cn(
							"h-full min-h-[300px] w-full resize-none font-mono text-sm",
							isDark
								? "border-gray-700 bg-[#1c1c1e] text-gray-100 focus-visible:ring-indigo-600"
								: "border-gray-300 bg-gray-50 text-gray-800 focus-visible:ring-indigo-500",
						)}
					/>
				</div>

				<DialogFooter className="mt-4 flex shrink-0 flex-col justify-between gap-2 sm:flex-row">
					<Button
						onClick={handleRegenerate}
						variant="outline"
						className={cn(
							"w-full text-white sm:w-auto",
							isDark
								? "bg-blue-600 hover:bg-blue-700"
								: "bg-blue-500 hover:bg-blue-600",
						)}
					>
						🔄 Actualizar JSON
					</Button>

					<Button
						onClick={handleCopy}
						className={cn(
							"w-full text-white sm:w-auto",
							isDark
								? "bg-green-600 hover:bg-green-700"
								: "bg-green-500 hover:bg-green-600",
						)}
					>
						Copiar y cerrar
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default GenerateJsonModal;
