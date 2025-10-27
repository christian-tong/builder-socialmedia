// src\config\nodesForms.ts

import FormDerivateNode from '@/components/forms/FormDerivateNode'
import FormEndNode from '@/components/forms/FormEndNode'
import FormMenuNode from '@/components/forms/FormMenuNode'
import FormMySQLQueryNode from '@/components/forms/FormMySQLQueryNode'
import FormSimpleTextNode from '@/components/forms/FormSimpleTextNode'
import FormStartNode from '@/components/forms/FormStartNode'
import FormSwitchConditionNode from '@/components/forms/FormSwitchConditionNode'
import FormTimeConditionNode from '@/components/forms/FormTimeConditionNode'
import FormVariablesNode from '@/components/forms/FormVariablesNode'

export const nodeFormRegistry: Record<string, any> = {
    startNode: FormStartNode,
    menuNode: FormMenuNode,
    simpleTextNode: FormSimpleTextNode,
    derivateNode: FormDerivateNode,
    timeConditionNode: FormTimeConditionNode,
    variablesNode: FormVariablesNode,
    switchConditionNode: FormSwitchConditionNode,
    mysqlQueryNode: FormMySQLQueryNode,
    endNode: FormEndNode,
}
