import { expect, jest, test } from '@jest/globals'
import { executeFunctionToolCall } from '../src/parts/FunctionCalling/FunctionCalling.ts'

test('executes completed function call arguments and creates response messages', async () => {
  const result = await executeFunctionToolCall({
    arguments: '{"location":"Paris"}',
    call_id: 'call-1',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  })

  expect(result).toHaveLength(2)
  const outputMessage = JSON.parse(result[0] || '{}')
  expect(outputMessage).toEqual({
    item: {
      call_id: 'call-1',
      output: expect.any(String),
      type: 'function_call_output',
    },
    type: 'conversation.item.create',
  })
  expect(JSON.parse(outputMessage.item.output)).toEqual({
    conditions: 'Sunny',
    humidity: 58,
    location: 'paris',
    temperature: 20,
    unit: 'C',
  })
  expect(result[1]).toBe(JSON.stringify({ type: 'response.create' }))
})

test('executes completed function call output items', async () => {
  const result = await executeFunctionToolCall({
    item: {
      arguments: '{"location":"London"}',
      call_id: 'call-2',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  })

  expect(result).toHaveLength(2)
  expect(result[0]).toContain('call-2')
  expect(result[0]).toContain('london')
})

test('executes workspace file function calls in the worker', async () => {
  const invoke = jest
    .fn<(method: string, ...params: readonly unknown[]) => Promise<unknown>>()
    .mockResolvedValueOnce('/workspace')
    .mockResolvedValueOnce('const value = 1')
  const globalScope = globalThis as typeof globalThis & {
    rpc: { readonly invoke: typeof invoke }
  }
  globalScope.rpc = { invoke }

  const result = await executeFunctionToolCall({
    arguments: '{"path":"src/index.ts"}',
    call_id: 'read-call',
    name: 'read_workspace_file',
    type: 'response.function_call_arguments.done',
  })

  expect(invoke).toHaveBeenNthCalledWith(
    1,
    'WorkspaceFileSystem.getWorkspaceFolder',
  )
  expect(invoke).toHaveBeenNthCalledWith(
    2,
    'WorkspaceFileSystem.readFile',
    '/workspace/src/index.ts',
  )
  expect(result[0]).toContain('const value = 1')
})

test.each([
  undefined,
  null,
  'value',
  {},
  { type: 'response.function_call_arguments.done' },
  { item: {}, type: 'response.output_item.done' },
])(
  'ignores events without a completed function call',
  async (event: unknown) => {
    await expect(executeFunctionToolCall(event)).resolves.toEqual([])
  },
)

test('rejects calls for unknown tools', async () => {
  await expect(
    executeFunctionToolCall({
      arguments: '{}',
      call_id: 'call-3',
      name: 'unknown',
      type: 'response.function_call_arguments.done',
    }),
  ).rejects.toThrow('Unknown function tool: unknown')
})
