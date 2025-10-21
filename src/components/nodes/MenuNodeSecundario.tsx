// src\components\nodes\MenuNodeSecundario.tsx

"use client";

import { motion } from "framer-motion";
import { ListChecks } from "lucide-react";
import type React from "react";
import { Handle, Position } from "reactflow";
import { Card } from "@/components/ui/card";
import { useFlowOrientationStore } from "@/store/useFlowOrientationStore";
import { useNodeConfigStore } from "@/store/useNodeConfigStore";

/**
 * 🔵 MenuNodeSecundario
 * ----------------------------------------------------
 * - Nodo de menú de segundo nivel
 * - Animación más ligera (entrada + movimiento)
 * - Compatible con Framer Motion v11+
 */
const MenuNodeSecundario = ({ id, data }: any) => {
	const { setSelectedNode } = useNodeConfigStore();
	const { orientation } = useFlowOrientationStore();

	const targetPosition =
		orientation === "vertical" ? Position.Top : Position.Left;
	const options = data.options || [];

	const handleBase: React.CSSProperties = {
		width: 10,
		height: 10,
		borderRadius: "50%",
		zIndex: 15,
		pointerEvents: "auto",
		position: "absolute",
	};

	return (
		<motion.div
			layout
			initial={{ scale: 0.9, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{
				type: "spring",
				stiffness: 100, // un poco más firme que el principal
				damping: 16,
				mass: 0.7,
			}}
		>
			<Card
				onClick={(e) => {
					e.stopPropagation();
					setSelectedNode({ id, type: "menuNodeSecundario", data });
				}}
				data-id={id}
				data-animated={data.__animated ? "true" : "false"}
				className="relative w-full max-w-[220px] cursor-pointer overflow-visible rounded-xl border border-sky-800 bg-sky-600 text-white shadow-md transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-lg dark:bg-sky-700"
			>
				{/* 🔹 Encabezado */}
				<div className="px-3 pt-1.5 pb-1 text-center">
					<div className="flex items-center justify-center gap-2">
						<ListChecks className="h-4 w-4 flex-shrink-0" />
						<span className="text-sm font-semibold break-words">
							{data.label || "Menú Secundario"}
						</span>
					</div>
					{data.variable && (
						<p className="mt-0.5 font-mono text-[11px] break-words opacity-90">
							Var: {data.variable}
						</p>
					)}
				</div>

				{/* 📨 Mensaje */}
				{data.message && (
					<div className="mx-3 my-1 rounded-md border border-sky-500/40 bg-sky-800/40 px-2.5 py-1 text-[11px] break-words text-sky-100 italic">
						{data.message}
					</div>
				)}

				{/* 🎯 Handle de entrada */}
				<Handle
					type="target"
					position={targetPosition}
					style={{
						top: orientation === "vertical" ? "-5px" : "50%",
						left: orientation === "vertical" ? "50%" : "-5px",
						transform:
							orientation === "vertical"
								? "translateX(-50%)"
								: "translateY(-50%)",
					}}
					className="h-[10px] w-[10px] rounded-full !bg-sky-300 shadow-sm"
				/>

				{/* 🔸 Opciones */}
				<div className="mt-0.5 flex flex-col">
					{options.map((opt: any, index: number) => (
						<div
							key={index}
							className="relative flex items-center justify-between border-t border-sky-700/50 bg-sky-700/40 px-3 py-[6px] text-[12px] transition-colors hover:bg-sky-700/60"
						>
							<div className="flex items-center gap-2">
								<span className="font-bold">{index + 1}:</span>
								<span className="truncate">
									{opt.title || `Opción ${index + 1}`}
								</span>
							</div>
							<Handle
								id={`option-${index}`}
								type="source"
								position={Position.Right}
								style={{
									top: "50%",
									right: "-5px",
									transform: "translateY(-50%)",
								}}
								className="h-[10px] w-[10px] rounded-full !bg-white shadow-sm"
							/>
						</div>
					))}
				</div>

				{/* 🟢🟡🔴 Handles de control */}
				<Handle
					type="source"
					id="onTrue"
					position={Position.Bottom}
					title="onTrue"
					style={{
						...handleBase,
						background: "#16a34a",
						bottom: "-6px",
						left: "25%",
					}}
				/>
				<Handle
					type="source"
					id="onFalse"
					position={Position.Bottom}
					title="onFalse"
					style={{
						...handleBase,
						background: "#f59e0b",
						bottom: "-6px",
						left: "50%",
					}}
				/>
				<Handle
					type="source"
					id="onError"
					position={Position.Bottom}
					title="onError"
					style={{
						...handleBase,
						background: "#dc2626",
						bottom: "-6px",
						left: "75%",
					}}
				/>
			</Card>
		</motion.div>
	);
};

export default MenuNodeSecundario;
