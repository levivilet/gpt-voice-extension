import { createRpc } from '@lvce-editor/api'
import type { FunctionToolDefinition } from '../FunctionToolDefinition/FunctionToolDefinition.ts'
import {
  executeWorkspaceFileFunctionToolCall,
  workspaceFileFunctionTools,
} from '../WorkspaceFileFunctionTools/WorkspaceFileFunctionTools.ts'

export type { FunctionToolDefinition } from '../FunctionToolDefinition/FunctionToolDefinition.ts'

interface Rpc {
  readonly invoke: (
    method: string,
    ...params: readonly unknown[]
  ) => Promise<unknown>
}

interface WebWorkerRpcOptions {
  readonly commandMap?: Readonly<Record<string, unknown>>
  readonly contentSecurityPolicy?: string
  readonly name?: string
  readonly url: string
}

type CreateRpc = (options: WebWorkerRpcOptions) => Promise<Rpc>

export const state: {
  createRpc: CreateRpc
  rpcPromise: Promise<Rpc> | undefined
} = {
  createRpc,
  rpcPromise: undefined,
}

const getRpc = (): Promise<Rpc> => {
  const { createRpc, rpcPromise } = state
  if (rpcPromise) {
    return rpcPromise
  }
  const newRpcPromise = createRpc({
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
    name: 'Voice Function Calling Worker',
    url: new URL('voiceFunctionCallingWorkerMain.js', import.meta.url).href,
  })
  state.rpcPromise = newRpcPromise
  return newRpcPromise
}

export const getRegisteredTools = async (): Promise<
  readonly FunctionToolDefinition[]
> => {
  const rpc = await getRpc()
  const workerTools = (await rpc.invoke(
    'VoiceFunctionCalling.getRegisteredTools',
  )) as readonly FunctionToolDefinition[]
  return [...workerTools, ...workspaceFileFunctionTools]
}

export const executeFunctionToolCall = async (
  functionCallEvent: unknown,
): Promise<readonly string[]> => {
  const workspaceFileMessages =
    await executeWorkspaceFileFunctionToolCall(functionCallEvent)
  if (workspaceFileMessages) {
    return workspaceFileMessages
  }
  const rpc = await getRpc()
  return rpc.invoke(
    'VoiceFunctionCalling.executeFunctionToolCall',
    functionCallEvent,
  ) as Promise<readonly string[]>
}
