import type * as Api from '@lvce-editor/api'
import { beforeEach, expect, jest, test } from '@jest/globals'

const invoke =
  jest.fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
const createRpc = jest.fn<typeof Api.createRpc>(
  async () =>
    ({
      invoke,
    }) as never,
)
const getWorkspaceFolder = jest.fn(async () => '/workspace')
const readFile = jest.fn<(uri: string) => Promise<string>>(
  async () => 'workspace content',
)
const writeFile = jest.fn<(uri: string, content: string) => Promise<void>>(
  async () => undefined,
)

// eslint-disable-next-line jest/no-restricted-jest-methods
jest.unstable_mockModule('@lvce-editor/api', () => {
  const actual = jest.requireActual<typeof Api>('@lvce-editor/api')
  return {
    ...actual,
    createRpc,
    getWorkspaceFolder,
    readFile,
    writeFile,
  }
})

const VoiceFunctionCallingWorker =
  await import('../src/parts/VoiceFunctionCallingWorker/VoiceFunctionCallingWorker.ts')

beforeEach(() => {
  createRpc.mockClear()
  invoke.mockReset()
  getWorkspaceFolder.mockClear()
  readFile.mockClear()
  writeFile.mockClear()
  VoiceFunctionCallingWorker.state.rpcPromise = undefined
})

test('creates a web worker RPC and queries registered tools', async () => {
  const tools = [
    {
      description: 'Test tool',
      name: 'test',
      parameters: {},
      type: 'function' as const,
    },
  ]
  invoke.mockResolvedValue(tools)

  await expect(VoiceFunctionCallingWorker.getRegisteredTools()).resolves.toBe(
    tools,
  )

  expect(createRpc).toHaveBeenCalledWith({
    commandMap: {
      'WorkspaceFileSystem.getWorkspaceFolder': getWorkspaceFolder,
      'WorkspaceFileSystem.readFile': readFile,
      'WorkspaceFileSystem.writeFile': writeFile,
    },
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
    name: 'Voice Function Calling Worker',
    url: new URL(
      'voiceFunctionCallingWorkerMain.js',
      import.meta.url,
    ).href.replace('/test/', '/src/parts/VoiceFunctionCallingWorker/'),
  })
  expect(invoke).toHaveBeenCalledWith('VoiceFunctionCalling.getRegisteredTools')
})

test('invokes a workspace file tool on the worker', async () => {
  const functionCallEvent = {
    arguments: '{"path":"src/index.ts"}',
    call_id: 'read-call',
    name: 'read_workspace_file',
    type: 'response.function_call_arguments.done',
  }

  const result = ['output', 'response']
  invoke.mockResolvedValue(result)

  await expect(
    VoiceFunctionCallingWorker.executeFunctionToolCall(functionCallEvent),
  ).resolves.toBe(result)

  expect(invoke).toHaveBeenCalledWith(
    'VoiceFunctionCalling.executeFunctionToolCall',
    functionCallEvent,
  )
  expect(readFile).not.toHaveBeenCalled()
})

test('invokes a function tool call on the worker', async () => {
  const functionCallEvent = {
    arguments: '{"location":"Paris"}',
    call_id: 'call-1',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  }
  const result = ['output', 'response']
  invoke.mockResolvedValue(result)

  await expect(
    VoiceFunctionCallingWorker.executeFunctionToolCall(functionCallEvent),
  ).resolves.toBe(result)

  expect(invoke).toHaveBeenCalledWith(
    'VoiceFunctionCalling.executeFunctionToolCall',
    functionCallEvent,
  )
})

test('reuses the worker RPC', async () => {
  invoke.mockResolvedValue([])

  await VoiceFunctionCallingWorker.getRegisteredTools()
  await VoiceFunctionCallingWorker.getRegisteredTools()

  expect(createRpc).toHaveBeenCalledTimes(1)
})
