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

// eslint-disable-next-line jest/no-restricted-jest-methods
jest.unstable_mockModule('@lvce-editor/api', () => {
  const actual = jest.requireActual<typeof Api>('@lvce-editor/api')
  return {
    ...actual,
    createRpc,
  }
})

const VoiceFunctionCallingWorker =
  await import('../src/parts/VoiceFunctionCallingWorker/VoiceFunctionCallingWorker.ts')

beforeEach(() => {
  createRpc.mockClear()
  invoke.mockReset()
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
    contentSecurityPolicy: "default-src 'none'; script-src 'self'",
    name: 'Voice Function Calling Worker',
    url: new URL(
      'voiceFunctionCallingWorkerMain.js',
      import.meta.url,
    ).href.replace('/test/', '/src/parts/VoiceFunctionCallingWorker/'),
  })
  expect(invoke).toHaveBeenCalledWith('VoiceFunctionCalling.getRegisteredTools')
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
