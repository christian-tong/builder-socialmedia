// src/config/nodesConfig.ts

import {
    Clock,
    GitBranch,
    ListTree,
    MessageSquare,
    PlayCircle,
    Power,
    UserCircle2,
    Variable,
    Database,
    MinusCircle,
    Brain,
    Save,
    KeyRound,
} from 'lucide-react'

import DerivateNode from '@/components/nodes/DerivateNode'
import EndNode from '@/components/nodes/EndNode'
import { SimpleTextNode } from '@/components/nodes/SimpleTextNode'
import { StartNode } from '@/components/nodes/StartNode'
import TimeConditionNode from '@/components/nodes/TimeConditionNode'
import { VariablesNode } from '@/components/nodes/VariablesNode' // 🧩 nuevo nodo
import SwitchConditionNode from '@/components/nodes/SwitchConditionNode'
import MySQLQueryNode from '@/components/nodes/MySQLQueryNode'
import NoOpNode from '@/components/nodes/NoOpNode'
import ChatBotIARequestNode from '@/components/nodes/ChatBotIARequestNode'
import SaveRecordNode from '@/components/nodes/SaveRecordNode'
import GenerateTokenNode from '@/components/nodes/GenerateTokenNode'
import { MenuNode } from '@/components/nodes/MenuNode'
import SetCustomerIDNode from '@/components/nodes/SetCustomerIDNode'

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
        type: 'menuNode',
        label: 'Menú',
        icon: ListTree,
        component: MenuNode,
    },
    {
        type: 'variablesNode',
        label: 'Variables',
        icon: Variable,
        component: VariablesNode,
    },
    {
        type: 'switchConditionNode',
        label: 'Condición Variable',
        icon: GitBranch,
        component: SwitchConditionNode,
    },
    {
        type: 'setCustomerIDNode',
        label: 'Set Customer ID',
        icon: UserCircle2,
        component: SetCustomerIDNode,
    },
    {
        type: 'mysqlQueryNode',
        label: 'MySQL Query',
        icon: Database,
        component: MySQLQueryNode,
    },

    {
        type: 'noopNode',
        label: 'No Operation',
        icon: MinusCircle,
        component: NoOpNode,
    },
    {
        type: 'chatBotIARequestNode',
        label: 'ChatBot IA Request',
        icon: Brain,
        component: ChatBotIARequestNode,
    },

    {
        type: 'timeConditionNode',
        label: 'Condición Tiempo',
        icon: Clock,
        component: TimeConditionNode,
    },
    {
        type: 'saveRecordNode',
        label: 'Guardar Registro',
        icon: Save,
        component: SaveRecordNode,
    },
    {
        type: 'generateTokenNode',
        label: 'Generar Token',
        icon: KeyRound,
        component: GenerateTokenNode,
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
    {
        type: 'endNode',
        label: 'Fin',
        icon: Power,
        component: EndNode,
    },
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
