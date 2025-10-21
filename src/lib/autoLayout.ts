// src\lib\autoLayout.ts

import dagre from "dagre";
import { type Edge, type Node, Position } from "reactflow";

/**
 * 📐 applyAutoLayoutAnimated
 * ------------------------------------------------------------
 * - Distribuye los nodos automáticamente (Dagre)
 * - Aplica animación suave entre posiciones anteriores y nuevas
 * - Corrige solapamientos residuales
 */
export function applyAutoLayout(
	nodes: Node[],
	edges: Edge[],
	orientation: "vertical" | "horizontal",
): Node[] {
	if (!nodes.length) return nodes;

	const isHorizontal = orientation === "horizontal";
	const dagreGraph = new dagre.graphlib.Graph();
	dagreGraph.setDefaultEdgeLabel(() => ({}));

	const DEFAULT_NODE_WIDTH = 200;
	const DEFAULT_NODE_HEIGHT = 90;
	const NODE_SEP = 140;
	const RANK_SEP = 250;

	dagreGraph.setGraph({
		rankdir: isHorizontal ? "LR" : "TB",
		align: "UL",
		nodesep: NODE_SEP,
		ranksep: RANK_SEP,
		marginx: 100,
		marginy: 100,
	});

	// ⚙️ Calcular tamaños dinámicos
	nodes.forEach((node) => {
		let width = DEFAULT_NODE_WIDTH;
		let height = DEFAULT_NODE_HEIGHT;
		const t = String(node.type || "").toLowerCase();
		const data: any = (node as any).data || {};

		if (t.includes("menu")) {
			width = 320;
			const optionsCount = Array.isArray(data.options)
				? data.options.length
				: 0;
			height = Math.max(150, 100 + optionsCount * 25);
		} else if (t.includes("derivate")) {
			width = 240;
			height = 100;
		} else if (t.includes("simpletext")) {
			width = 260;
			height = 90;
		} else if (t.includes("timecondition") || t.includes("condition")) {
			width = 240;
			height = 110;
		} else if (
			t.includes("end") ||
			t.includes("hangup") ||
			t.includes("start")
		) {
			width = 140;
			height = 64;
		}

		dagreGraph.setNode(node.id, { width, height });
	});

	edges.forEach((edge) => {
		if (edge.source && edge.target) {
			dagreGraph.setEdge(edge.source, edge.target);
		}
	});

	dagre.layout(dagreGraph);

	// 🧭 Nueva posición base
	const laidOutNodes = nodes.map((node) => {
		const pos = dagreGraph.node(node.id);
		if (!pos) return node;

		node.targetPosition = isHorizontal ? Position.Left : Position.Top;
		node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

		const target = {
			x: pos.x - (pos.width ?? DEFAULT_NODE_WIDTH) / 2,
			y: pos.y - (pos.height ?? DEFAULT_NODE_HEIGHT) / 2,
		};

		return {
			...node,
			position: applySmoothTransition(node.position, target),
			data: {
				...node.data,
				__animated: true, // flag para estilo CSS animado
			},
		};
	});

	// 🪄 Corregir offsets negativos
	const minX = Math.min(...laidOutNodes.map((n) => n.position.x));
	const minY = Math.min(...laidOutNodes.map((n) => n.position.y));
	const offsetX = minX < 0 ? Math.abs(minX) + 50 : 0;
	const offsetY = minY < 0 ? Math.abs(minY) + 50 : 0;

	return laidOutNodes.map((n) => ({
		...n,
		position: {
			x: n.position.x + offsetX,
			y: n.position.y + offsetY,
		},
	}));
}

/**
 * 🌀 Interpolación de movimiento — suaviza entre posición actual y nueva
 * Usando easing tipo “easeOutElastic”
 */
function applySmoothTransition(
	current: { x: number; y: number },
	target: { x: number; y: number },
	tension = 0.2,
): { x: number; y: number } {
	if (!current) return target;
	const easeOutElastic = (t: number) =>
		2 ** (-10 * t) * Math.sin(((t - 0.075) * (2 * Math.PI)) / 0.3) + 1;
	const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

	// aplicamos interpolación solo parcial (frame simulated)
	const t = easeOutElastic(tension);
	return {
		x: lerp(current.x, target.x, t),
		y: lerp(current.y, target.y, t),
	};
}
