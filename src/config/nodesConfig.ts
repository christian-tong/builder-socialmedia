// src/config/nodesConfig.ts
import {
    Clock,
    FileText,
    ListChecks,
    ListTree,
    MessageSquare,
    PlayCircle,
    Power,
    UserCircle2,
} from 'lucide-react'
import DerivateNode from '@/components/nodes/DerivateNode'
import EndNode from '@/components/nodes/EndNode'
import MenuNodePrincipal from '@/components/nodes/MenuNodePrincipal'
import MenuNodeSecundario from '@/components/nodes/MenuNodeSecundario'
import { SimpleTextNode } from '@/components/nodes/SimpleTextNode'
import { StartNode } from '@/components/nodes/StartNode'
import TimeConditionNode from '@/components/nodes/TimeConditionNode'

// =============================================================
// 🔒 Extiende el namespace global (para cachear nodeTypes)
// =============================================================
declare global {
    // eslint-disable-next-line no-var
    var __NODE_TYPES__: Record<string, any> | undefined
}

// =============================================================
// 🧱 Registro de nodos
// =============================================================
export const nodeRegistry = [
    {
        type: 'startNode',
        label: 'Inicio',
        icon: PlayCircle,
        component: StartNode,
    },
    {
        type: 'menuNodePrincipal',
        label: 'Menú Principal',
        icon: ListTree,
        component: MenuNodePrincipal,
    },
    {
        type: 'menuNodeSecundario',
        label: 'Menú Secundario',
        icon: ListChecks,
        component: MenuNodeSecundario,
    },
    {
        type: 'timeConditionNode',
        label: 'Condición Tiempo',
        icon: Clock,
        component: TimeConditionNode,
    },
    {
        type: 'derivateNode',
        label: 'Derivar',
        icon: UserCircle2,
        component: DerivateNode,
    },
    {
        type: 'simpleTextNode',
        label: 'Texto',
        icon: MessageSquare,
        component: SimpleTextNode,
    },
    { type: 'endNode', label: 'Fin', icon: Power, component: EndNode },
] as const

// =============================================================
// 🧠 Cache global contra HMR (sin useMemo)
// =============================================================
if (!globalThis.__NODE_TYPES__) {
    globalThis.__NODE_TYPES__ = Object.freeze(
        Object.fromEntries(nodeRegistry.map((n) => [n.type, n.component]))
    )
}

export const nodeTypes = globalThis.__NODE_TYPES__
