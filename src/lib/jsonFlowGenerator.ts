// src/lib/jsonFlowGenerator.ts

import type { Edge, Node } from "reactflow";

/**
 * 🧠 generateConversationJson
 * ----------------------------------------------------
 * Convierte nodos y edges del React Flow en el JSON
 * estructurado compatible con WiContact (process.steps)
 * - Crea dinámicamente onTrue / onFalse / onError
 * - Soporta menús principal/secundario, texto, derivación, tiempo, fin
 * - Tipado completo y seguro para TypeScript
 */

export interface WiStep {
	id: string;
	action: string;
	onTrue?: string | null;
	onFalse?: string | null;
	onError?: string | null;
	isInteractive?: boolean;
	source?: string;
	interactiveVersion?: number;
	object: Record<string, any>;
}

export interface WiProcess {
	process: {
		steps: WiStep[];
	};
}

export function generateConversationJson(
	nodes: Node<Record<string, any>>[],
	edges: Edge[],
): WiProcess {
	const steps: WiStep[] = [];

	// 🔍 Helpers
	const getOutgoingEdges = (sourceId: string): Edge[] =>
		edges.filter((e) => e.source === sourceId);

	const getConnectedTarget = (
		edgeList: Edge[],
		sourceId: string,
		handleId: string,
	): string | null => {
		const edge = edgeList.find(
			(e) => e.source === sourceId && e.sourceHandle === handleId,
		);
		return edge?.target ?? null;
	};

	// 🧱 Construcción de pasos
	for (const node of nodes) {
		const { id, type, data } = node;
		const outgoing = getOutgoingEdges(id);

		// 🔗 Detectar salidas de control
		const onTrue = getConnectedTarget(outgoing, id, "onTrue");
		const onFalse = getConnectedTarget(outgoing, id, "onFalse");
		const onError = getConnectedTarget(outgoing, id, "onError");

		switch (type) {
			/** 🟦 Texto Simple */
			case "simpleTextNode": {
				const text = encodeURIComponent(data?.message ?? "");
				steps.push({
					id,
					action: "simpletext",
					onTrue,
					object: {
						groodText: data?.groodText ?? "",
						text,
					},
				});
				break;
			}

			/** 🟠 Derivación */
			case "derivateNode": {
				steps.push({
					id,
					action: "derivate",
					onTrue,
					onFalse,
					onError,
					object: {
						timeoutMessage: encodeURIComponent(data?.timeoutMessage ?? ""),
						skill: data?.skill ? Number(data.skill) : 0,
						queueMessage: encodeURIComponent(data?.queueMessage ?? ""),
						inboundMessage: encodeURIComponent(data?.inboundMessage ?? ""),
						groodText_queueMessage: data?.groodText_queueMessage ?? "",
						groodText_inboundMessage: data?.groodText_inboundMessage ?? "",
					},
				});
				break;
			}

			/** 🕓 Condición de tiempo */
			case "timeConditionNode": {
				steps.push({
					id,
					action: "timecondition",
					onTrue,
					onFalse,
					object: {
						condition: data?.condition ?? "",
					},
				});
				break;
			}

			/** 🟣 Menú Principal (quick_reply) */
			case "menuNodePrincipal": {
				const options = (data?.options ?? []) as {
					postbackText: string;
					title: string;
				}[];

				const outgoingEdges = getOutgoingEdges(id);
				const setvariables: Record<string, string> = {};
				const conditions: Record<string, string> = {};

				options.forEach((opt, index) => {
					setvariables[opt.postbackText] = opt.title ?? "";
					const foundEdge = outgoingEdges.find(
						(e) => e.sourceHandle === `option-${index}`,
					);
					if (foundEdge?.target)
						conditions[opt.postbackText] = foundEdge.target;
				});

				// Generar rango dinámico tipo [1-3]
				const numeric = options
					.map((o) => Number(o.postbackText))
					.filter((n) => !isNaN(n));
				const min = Math.min(...numeric);
				const max = Math.max(...numeric);
				const conditionRange = numeric.length > 0 ? `[${min}-${max}]` : "[1-1]";

				steps.push({
					id,
					action: "getdatacomplete",
					onTrue,
					onFalse,
					onError,
					isInteractive: true,
					source: "GetData",
					interactiveVersion: 4,
					object: {
						setvariables,
						condition: conditionRange,
						groodText: "",
						setvar: data?.variable ?? "PRIMER_NIVEL",
						variable: data?.variable ?? "PrimeraOpcion",
						saveHidden: true,
						interactive: {
							options: options.map((opt) => ({
								postbackText: opt.postbackText,
								type: "text",
								title: encodeURIComponent(opt.title ?? ""),
							})),
							msgid: "qr1",
							type: "quick_reply",
							content: {
								text: encodeURIComponent(data?.message ?? ""),
								type: "text",
							},
						},
						alias: data?.variable ?? "PrimeraOpcion",
						conditions,
						iterations: "2",
						timeOut: "90000",
					},
				});
				break;
			}

			/** 🔵 Menú Secundario (list) */
			case "menuNodeSecundario": {
				const options = (data?.options ?? []) as {
					postbackText: string;
					title: string;
				}[];

				const outgoingEdges = getOutgoingEdges(id);
				const setvariables: Record<string, string> = {};
				const conditions: Record<string, string> = {};

				options.forEach((opt, index) => {
					setvariables[opt.postbackText] = opt.title ?? "";
					const foundEdge = outgoingEdges.find(
						(e) => e.sourceHandle === `option-${index}`,
					);
					if (foundEdge?.target)
						conditions[opt.postbackText] = foundEdge.target;
				});

				const numeric = options
					.map((o) => Number(o.postbackText))
					.filter((n) => !isNaN(n));
				const min = Math.min(...numeric);
				const max = Math.max(...numeric);
				const conditionRange = numeric.length > 0 ? `[${min}-${max}]` : "[1-1]";

				steps.push({
					id,
					action: "getdatacomplete",
					onTrue,
					onFalse,
					onError,
					isInteractive: true,
					source: "GetData",
					interactiveVersion: 4,
					object: {
						setvariables,
						condition: conditionRange,
						groodText: "",
						setvar: data?.variable ?? "SEGUNDO_NIVEL",
						variable: data?.variable ?? "SegundaOpcion",
						saveHidden: true,
						interactive: {
							globalButtons: [{ type: "text", title: "Elegir" }],
							type: "list",
							body: encodeURIComponent(data?.message ?? ""),
							items: [
								{
									options: options.map((opt) => ({
										postbackText: opt.postbackText,
										type: "text",
										title: encodeURIComponent(opt.title ?? ""),
									})),
									title: "Elija una opción",
								},
							],
						},
						alias: data?.variable ?? "SegundaOpcion",
						conditions,
						iterations: "2",
						timeOut: "90000",
					},
				});
				break;
			}

			/** 🟥 Fin */
			case "endNode": {
				steps.push({
					id,
					action: "hangup",
					object: {
						HangupCause: data?.hangupCause ?? "",
					},
				});
				break;
			}

			default:
				break;
		}
	}

	// 🟢 Nodo inicial automático (StartStep)
	const firstNode = nodes.find((n) => n.type === "startNode");
	if (firstNode) {
		const outgoing = getOutgoingEdges(firstNode.id);
		const next = outgoing[0]?.target ?? null;

		steps.unshift({
			id: firstNode.id,
			action: "startstep",
			onTrue: next,
			object: {},
		});
	}

	// 🔚 Estructura final
	return {
		process: {
			steps,
		},
	};
}
