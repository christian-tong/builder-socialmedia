// src\components\nodes\SimpleTextNode.tsx
"use client";

import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🟦 SimpleTextNode
 * ----------------------------------------------------
 * - Nodo visual con animación fluida de entrada y movimiento
 * - Compatible con Framer Motion v11+
 * - Sin layoutTransition (ya deprecado)
 */
export function SimpleTextNode({ id, data }: any) {
	const { setSelectedNode } = useNodeConfigStore();
	const { orientation } = useFlowOrientationStore();

	const targetPosition =
		orientation === "vertical" ? Position.Top : Position.Left;
	const sourcePosition =
		orientation === "vertical" ? Position.Bottom : Position.Right;

	return (
		<motion.div
			layout
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{
				type: "spring",
				stiffness: 80,
				damping: 14,
				mass: 0.6,
			}}
		>
			<Card
				onClick={(e) => {
					e.stopPropagation();
					setSelectedNode({ id, type: "simpleTextNode", data });
				}}
				data-id={id}
				data-animated={data.__animated ? "true" : "false"}
				className="relative w-full max-w-[220px] cursor-pointer rounded-lg border border-indigo-700 bg-indigo-600 px-3 py-2 text-center text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.03] hover:shadow-lg"
			>
				<div className="flex flex-col items-center justify-center gap-1 overflow-hidden">
					{/* 🔹 Título */}
					<div className="flex items-center justify-center gap-2">
						<MessageSquare className="h-4 w-4 flex-shrink-0" />
						<span className="text-sm font-medium break-words">
							{data.label || "Texto sin título"}
						</span>
					</div>

					{/* 🔹 Contenido dinámico */}
					{data.message && (
						<p
							className="mt-1 text-center text-[11px] leading-snug break-words opacity-85"
							style={{
								whiteSpace: "pre-wrap",
								wordBreak: "break-word",
							}}
						>
							{data.message}
						</p>
					)}
				</div>

				{/* 🟢🟡🔴 Handles */}
				<Handle
					type="target"
					position={targetPosition}
					className="!bg-indigo-400"
				/>
				<Handle
					type="source"
					position={sourcePosition}
					className="!bg-indigo-400"
				/>
			</Card>
		</motion.div>
	);
}
