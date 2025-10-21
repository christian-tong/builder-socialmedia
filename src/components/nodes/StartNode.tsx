// src\components\nodes\StartNode.tsx

"use client";

import { motion } from "framer-motion";
import { PlayCircle } from "lucide-react";
import React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🟢 StartNode
 * ----------------------------------------------------
 * - Nodo inicial del flujo
 * - Animación más enérgica y destacada
 * - Compatible con Framer Motion v11+
 */
export function StartNode({ id, data }: any) {
	const { setSelectedNode } = useNodeConfigStore();
	const { orientation } = useFlowOrientationStore();
	const handlePosition =
		orientation === "vertical" ? Position.Bottom : Position.Right;

	return (
		<motion.div
			layout
			initial={{ scale: 0.7, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{
				type: "spring",
				stiffness: 100,
				damping: 10,
				mass: 0.6,
			}}
		>
			<Card
				onClick={(e) => {
					e.stopPropagation();
					setSelectedNode({ id, type: "startNode", data });
				}}
				data-id={id}
				className="cursor-pointer rounded-lg border border-emerald-700 bg-emerald-600 px-3 py-2 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.05] hover:shadow-lg"
			>
				<div className="flex items-center justify-center gap-2">
					<PlayCircle className="h-4 w-4" />
					<span className="text-sm font-medium">{data.label || "Inicio"}</span>
				</div>

				{/* 🟢 Handle de salida */}
				<Handle
					type="source"
					position={handlePosition}
					className="!bg-emerald-400"
				/>
			</Card>
		</motion.div>
	);
}
