import { expect, jest, test } from '@jest/globals'
import type { WorkspaceFileSystemApi } from '../src/parts/WorkspaceFileSystem/WorkspaceFileSystem.ts'
import {
  executeWorkspaceFileFunctionToolCall,
  workspaceFileFunctionTools,
} from '../src/parts/WorkspaceFileFunctionTools/WorkspaceFileFunctionTools.ts'

const createFileSystemApi = (
  workspaceFolder = '/workspace',
): WorkspaceFileSystemApi => ({
  getWorkspaceFolder: jest.fn(async () => workspaceFolder),
  readFile: jest.fn(async () => 'const value = 1'),
  writeFile: jest.fn(async () => undefined),
})

const getToolOutput = (messages: readonly string[]): unknown => {
  const message = JSON.parse(messages[0])
  return JSON.parse(message.item.output)
}

test('exposes workspace file tool definitions', () => {
  expect(workspaceFileFunctionTools.map((tool) => tool.name)).toEqual([
    'read_workspace_file',
    'write_workspace_file',
  ])
  expect(workspaceFileFunctionTools[0]?.parameters.required).toEqual(['path'])
  expect(workspaceFileFunctionTools[1]?.parameters.required).toEqual([
    'path',
    'content',
  ])
})

test('reads a workspace file', async () => {
  const fileSystemApi = createFileSystemApi()
  const messages = await executeWorkspaceFileFunctionToolCall(
    {
      arguments: JSON.stringify({ path: 'src/index.ts' }),
      call_id: 'read-call',
      name: 'read_workspace_file',
      type: 'response.function_call_arguments.done',
    },
    fileSystemApi,
  )

  expect(messages).toHaveLength(2)
  expect(fileSystemApi.readFile).toHaveBeenCalledWith('/workspace/src/index.ts')
  expect(getToolOutput(messages || [])).toEqual({
    content: 'const value = 1',
    path: 'src/index.ts',
  })
})

test('writes a workspace file from an output item event', async () => {
  const fileSystemApi = createFileSystemApi()
  const messages = await executeWorkspaceFileFunctionToolCall(
    {
      item: {
        arguments: JSON.stringify({
          content: 'const value = 2',
          path: 'src/index.ts',
        }),
        call_id: 'write-call',
        name: 'write_workspace_file',
        type: 'function_call',
      },
      type: 'response.output_item.done',
    },
    fileSystemApi,
  )

  expect(fileSystemApi.writeFile).toHaveBeenCalledWith(
    '/workspace/src/index.ts',
    'const value = 2',
  )
  expect(getToolOutput(messages || [])).toEqual({
    path: 'src/index.ts',
    written: true,
  })
})

test.each([
  [
    '{"path":"../outside.txt"}',
    'Workspace file path cannot leave the opened workspace.',
  ],
  ['{}', 'Function tool argument "path" must be a string.'],
  ['[]', 'Function tool arguments must be a JSON object.'],
  ['{', 'Function tool arguments must be valid JSON.'],
])('returns tool errors to the model for %s', async (argumentsValue, error) => {
  const fileSystemApi = createFileSystemApi()
  const messages = await executeWorkspaceFileFunctionToolCall(
    {
      arguments: argumentsValue,
      call_id: 'read-call',
      name: 'read_workspace_file',
      type: 'response.function_call_arguments.done',
    },
    fileSystemApi,
  )

  expect(fileSystemApi.readFile).not.toHaveBeenCalled()
  expect(getToolOutput(messages || [])).toEqual({ error })
})

test.each([
  undefined,
  null,
  {},
  {
    arguments: '{}',
    call_id: 'call',
    name: 'getweather',
    type: 'response.function_call_arguments.done',
  },
  {
    arguments: 1,
    call_id: 'call',
    name: 'read_workspace_file',
    type: 'response.function_call_arguments.done',
  },
  { item: {}, type: 'response.output_item.done' },
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
])('ignores non-workspace function call %#', async (event) => {
  await expect(
    executeWorkspaceFileFunctionToolCall(event),
  ).resolves.toBeUndefined()
})
