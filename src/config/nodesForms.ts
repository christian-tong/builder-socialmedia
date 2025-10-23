// src\config\nodesForms.ts

import FormDerivateNode from '@/components/forms/FormDerivateNode'
import FormEndNode from '@/components/forms/FormEndNode'
import FormMenuNode from '@/components/forms/FormMenuNode'
import FormSimpleTextNode from '@/components/forms/FormSimpleTextNode'
import FormStartNode from '@/components/forms/FormStartNode'
import FormTimeConditionNode from '@/components/forms/FormTimeConditionNode'

export const nodeFormRegistry: Record<string, any> = {
    startNode: FormStartNode,
    menuNode: FormMenuNode,
    simpleTextNode: FormSimpleTextNode,
    derivateNode: FormDerivateNode,
    timeConditionNode: FormTimeConditionNode,
    endNode: FormEndNode,
}
