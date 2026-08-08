import { expect, jest, test } from '@jest/globals'
import type { WorkspaceFileSystemApi } from '../src/parts/WorkspaceFileSystem/WorkspaceFileSystem.ts'
import { handleFunctionCall } from '../src/parts/FunctionCalling/FunctionCalling.ts'

const createFileSystemApi = (): WorkspaceFileSystemApi => ({
  getWorkspaceFolder: jest.fn(async () => '/workspace'),
  readFile: jest.fn(async () => 'const value = 1'),
  writeFile: jest.fn(async () => undefined),
})

test.each([
  {
    arguments: JSON.stringify({ location: 'Paris' }),
    call_id: 'call-1',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  },
  {
    item: {
      arguments: JSON.stringify({ location: 'London' }),
      call_id: 'call-2',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
])('handleFunctionCall - responds to supported call %#', async (event) => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)

  await handleFunctionCall(event, send)

  expect(send).toHaveBeenCalledTimes(2)
  expect(JSON.parse(send.mock.calls[0][0])).toMatchObject({
    item: {
      call_id: expect.any(String),
      type: 'function_call_output',
    },
    type: 'conversation.item.create',
  })
  expect(JSON.parse(send.mock.calls[1][0])).toEqual({ type: 'response.create' })
})

test('handleFunctionCall - reads a workspace file', async () => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)
  const fileSystemApi = createFileSystemApi()

  await handleFunctionCall(
    {
      arguments: JSON.stringify({ path: 'src/index.ts' }),
      call_id: 'read-call',
      name: 'read_workspace_file',
      type: 'response.function_call_arguments.done',
    },
    send,
    fileSystemApi,
  )

  expect(fileSystemApi.readFile).toHaveBeenCalledWith('/workspace/src/index.ts')
  const output = JSON.parse(JSON.parse(send.mock.calls[0][0]).item.output)
  expect(output).toEqual({
    content: 'const value = 1',
    path: 'src/index.ts',
  })
})

test('handleFunctionCall - writes a workspace file', async () => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)
  const fileSystemApi = createFileSystemApi()

  await handleFunctionCall(
    {
      arguments: JSON.stringify({
        content: 'const value = 2',
        path: 'src/index.ts',
      }),
      call_id: 'write-call',
      name: 'write_workspace_file',
      type: 'response.function_call_arguments.done',
    },
    send,
    fileSystemApi,
  )

  expect(fileSystemApi.writeFile).toHaveBeenCalledWith(
    '/workspace/src/index.ts',
    'const value = 2',
  )
  const output = JSON.parse(JSON.parse(send.mock.calls[0][0]).item.output)
  expect(output).toEqual({ path: 'src/index.ts', written: true })
})

test('handleFunctionCall - returns workspace path errors to the model', async () => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)
  const fileSystemApi = createFileSystemApi()

  await handleFunctionCall(
    {
      arguments: JSON.stringify({ path: '../outside.txt' }),
      call_id: 'read-call',
      name: 'read_workspace_file',
      type: 'response.function_call_arguments.done',
    },
    send,
    fileSystemApi,
  )

  expect(fileSystemApi.readFile).not.toHaveBeenCalled()
  const output = JSON.parse(JSON.parse(send.mock.calls[0][0]).item.output)
  expect(output).toEqual({
    error: 'Workspace file path cannot leave the opened workspace.',
  })
  expect(send).toHaveBeenCalledTimes(2)
})

test('handleFunctionCall - returns invalid argument errors to the model', async () => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)

  await handleFunctionCall(
    {
      arguments: '{}',
      call_id: 'weather-call',
      name: 'getweather',
      type: 'response.function_call_arguments.done',
    },
    send,
  )

  const output = JSON.parse(JSON.parse(send.mock.calls[0][0]).item.output)
  expect(output).toEqual({
    error: 'Function tool argument "location" must be a string.',
  })
  expect(send).toHaveBeenCalledTimes(2)
})

test.each([
  undefined,
  null,
  'event',
  {},
  { type: 'other' },
  { arguments: 1, type: 'response.function_call_arguments.done' },
  { arguments: '{', type: 'response.function_call_arguments.done' },
  { arguments: 'null', type: 'response.function_call_arguments.done' },
  { arguments: '1', type: 'response.function_call_arguments.done' },
  {
    arguments: '{}',
    call_id: 1,
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  },
  {
    arguments: '{}',
    call_id: 'call',
    name: 1,
    type: 'response.function_call_arguments.done',
  },
  {
    arguments: '{"location":"Paris"}',
    call_id: 'call',
    name: 'other',
    type: 'response.function_call_arguments.done',
  },
  { type: 'response.output_item.done' },
  { item: 1, type: 'response.output_item.done' },
  { item: {}, type: 'response.output_item.done' },
  { item: { type: 'other' }, type: 'response.output_item.done' },
  {
    item: {
      arguments: '{}',
      call_id: 1,
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  {
    item: {
      arguments: '{}',
      call_id: 'call',
      name: 1,
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  {
    item: {
      arguments: 1,
      call_id: 'call',
      name: 'getweather',
      type: 'function_call',
    },
    type: 'response.output_item.done',
  },
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
])('handleFunctionCall - ignores unsupported event %#', async (event) => {
  const send = jest.fn<(data: string) => Promise<void>>(async () => undefined)

  await handleFunctionCall(event, send)

  expect(send).not.toHaveBeenCalled()
})
