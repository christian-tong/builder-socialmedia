/**
 * 📘 WiContact GetDataComplete Types
 * -------------------------------------------------------------
 * Tipos unificados para manejar y renderizar los comportamientos
 * del flujo "getdatacomplete" en el Builder Social Media.
 *
 * ✅ Objetivo:
 * - Estandarizar la estructura entre variantes (quick_reply, list, etc.)
 * - Facilitar la extensión a nuevos tipos de comportamiento
 * - Mejorar autocompletado, validación y mantenibilidad del código
 */

/* -------------------------------------------------------------------------- */
/* 🧩 BASE GENERAL DE NODO GETDATACOMPLETE                                    */
/* -------------------------------------------------------------------------- */

/**
 * Estructura principal de un nodo "getdatacomplete".
 * Contiene la metadata del flujo y un objeto interno `object`
 * que varía según el comportamiento.
 */
export interface WiGetDataBase {
	id: string
	action: 'getdatacomplete'
	onTrue?: string
	onFalse?: string
	onError?: string
	isInteractive: boolean
	source: string
	interactiveVersion: number
	object: WiGetDataObjectBase
}

/* -------------------------------------------------------------------------- */
/* ⚙️ BASE COMÚN DE OBJECT                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Campos comunes que existen en todos los tipos de getdatacomplete.
 * La clave aquí es `interactive`, que define el comportamiento concreto.
 */
export interface WiGetDataObjectBase {
	setvariables: Record<string, string>
	condition: string
	setvar: string
	variable: string
	saveHidden: boolean
	alias?: string
	iterations?: string
	timeOut?: string
	conditions: Record<string, string>
	interactive: WiInteractiveBase
}

/* -------------------------------------------------------------------------- */
/* 🧩 VARIANTES DE INTERACTIVO                                               */
/* -------------------------------------------------------------------------- */

/**
 * Tipo base para todas las estructuras "interactive".
 * Sirve de ancla para extender con tipos concretos.
 */
export interface WiInteractiveBase {
	type: string
}

/**
 * 💬 Variante Quick Reply
 * -------------------------------------------------------------
 * - Se usa para menús iniciales tipo botones rápidos.
 * - Contiene un mensaje directo y un conjunto plano de opciones.
 */
export interface WiInteractiveQuickReply extends WiInteractiveBase {
	type: 'quick_reply'
	msgid: string
	content: {
		type: 'text'
		text: string // texto codificado (URI encoded)
	}
	options: {
		type: 'text'
		title: string
		postbackText: string
	}[]
}

/**
 * 📋 Variante List
 * -------------------------------------------------------------
 * - Se usa para menús jerárquicos con subniveles o múltiples items.
 * - Contiene cuerpo, botones globales y listas anidadas de opciones.
 */
export interface WiInteractiveList extends WiInteractiveBase {
	type: 'list'
	body: string // texto codificado (URI encoded)
	globalButtons: { type: string; title: string }[]
	items: {
		title: string
		options: {
			type: string
			title: string
			postbackText: string
			description?: string
		}[]
	}[]
}

/* -------------------------------------------------------------------------- */
/* 🧩 OBJETOS COMPLETOS POR VARIANTE                                         */
/* -------------------------------------------------------------------------- */

/**
 * 🟢 QuickReply — primer nivel (bienvenida / opciones rápidas)
 */
export interface WiGetDataQuickReply extends WiGetDataBase {
	object: WiGetDataObjectBase & {
		interactive: WiInteractiveQuickReply
	}
}

/**
 * 🟦 List — segundo o tercer nivel (menús en lista)
 */
export interface WiGetDataList extends WiGetDataBase {
	object: WiGetDataObjectBase & {
		interactive: WiInteractiveList
	}
}

/* -------------------------------------------------------------------------- */
/* 🔀 UNION PRINCIPAL                                                        */
/* -------------------------------------------------------------------------- */

/**
 * WiGetDataComplete
 * -------------------------------------------------------------
 * Unión de todos los posibles comportamientos de getdatacomplete.
 * Permite un manejo flexible y seguro en componentes o parsers.
 */
export type WiGetDataComplete = WiGetDataQuickReply | WiGetDataList

/* -------------------------------------------------------------------------- */
/* 🧠 UTILIDADES OPCIONALES (ayuda en UI/renderizado)                         */
/* -------------------------------------------------------------------------- */

/**
 * Detecta el tipo de comportamiento (útil para condicionar componentes)
 */
export type WiGetDataVariant = 'quick_reply' | 'list'

/**
 * Campos clave que pueden variar visualmente entre variantes
 */
export interface WiGetDataVariantMap {
	variant: WiGetDataVariant
	label: string
	description: string
	icon?: string
}
