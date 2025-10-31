// src\config\nodesForms.ts

import FormChatBotIARequestNode from '@/components/forms/FormChatBotIARequestNode'
import FormDerivateNode from '@/components/forms/FormDerivateNode'
import FormEndNode from '@/components/forms/FormEndNode'
import FormGenerateTokenNode from '@/components/forms/FormGenerateTokenNode'
import FormMySQLQueryNode from '@/components/forms/FormMySQLQueryNode'
import FormNoOpNode from '@/components/forms/FormNoOpNode'
import FormSaveRecordNode from '@/components/forms/FormSaveRecordNode'
import FormSimpleTextNode from '@/components/forms/FormSimpleTextNode'
import FormStartNode from '@/components/forms/FormStartNode'
import FormSwitchConditionNode from '@/components/forms/FormSwitchConditionNode'
import FormTimeConditionNode from '@/components/forms/FormTimeConditionNode'
import FormVariablesNode from '@/components/forms/FormVariablesNode'
import FormGetDataCompleteBase from '@/components/forms/Menu/FormGetDataCompleteBase'

export const nodeFormRegistry: Record<string, any> = {
    startNode: FormStartNode,
    menuNode: FormGetDataCompleteBase,
    simpleTextNode: FormSimpleTextNode,
    derivateNode: FormDerivateNode,
    timeConditionNode: FormTimeConditionNode,
    variablesNode: FormVariablesNode,
    switchConditionNode: FormSwitchConditionNode,
    mysqlQueryNode: FormMySQLQueryNode,
    noopNode: FormNoOpNode,
    chatBotIARequestNode: FormChatBotIARequestNode,
    saveRecordNode: FormSaveRecordNode,
    generateTokenNode: FormGenerateTokenNode,
    endNode: FormEndNode,
}
