import * as FunctionCalling from '../FunctionCalling/FunctionCalling.ts'
import * as FunctionToolRegistry from '../FunctionToolRegistry/FunctionToolRegistry.ts'

export const commandMap: Readonly<Record<string, unknown>> = {
  'VoiceFunctionCalling.executeFunctionToolCall':
    FunctionCalling.executeFunctionToolCall,
  'VoiceFunctionCalling.getRegisteredTools':
    FunctionToolRegistry.getRegisteredTools,
}
