import {
  createRpc,
  getWorkspaceUri,
  readDirWithFileTypes,
  readFile,
  writeFile,
} from '@lvce-editor/api'

export interface FunctionToolDefinition {
  readonly description: string
  readonly name: string
  readonly parameters: Readonly<Record<string, unknown>>
  readonly type: 'function'
}

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

const commandMap = {
  'WorkspaceFileSystem.getWorkspaceUri': getWorkspaceUri,
  'WorkspaceFileSystem.readDirWithFileTypes': readDirWithFileTypes,
  'WorkspaceFileSystem.readFile': readFile,
  'WorkspaceFileSystem.writeFile': writeFile,
}

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
    commandMap,
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
  return rpc.invoke('VoiceFunctionCalling.getRegisteredTools') as Promise<
    readonly FunctionToolDefinition[]
  >
}

export const executeFunctionToolCall = async (
  functionCallEvent: unknown,
): Promise<readonly string[]> => {
  const rpc = await getRpc()
  return rpc.invoke(
    'VoiceFunctionCalling.executeFunctionToolCall',
    functionCallEvent,
  ) as Promise<readonly string[]>
}
