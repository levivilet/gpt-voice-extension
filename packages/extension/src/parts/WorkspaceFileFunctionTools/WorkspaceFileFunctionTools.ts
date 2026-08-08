import type { FunctionToolDefinition } from '../FunctionToolDefinition/FunctionToolDefinition.ts'
import {
  readWorkspaceFile,
  type WorkspaceFileSystemApi,
  writeWorkspaceFile,
} from '../WorkspaceFileSystem/WorkspaceFileSystem.ts'

interface FunctionCallArguments {
  readonly argumentsValue: string
  readonly callId: string
  readonly name: string
}

const createToolOutputMessage = (callId: string, output: string): string => {
  return JSON.stringify({
    item: {
      call_id: callId,
      output,
      type: 'function_call_output',
    },
    type: 'conversation.item.create',
  })
}

const createFunctionResultResponseMessage = (): string => {
  return JSON.stringify({
    type: 'response.create',
  })
}

const parseFunctionCall = (
  parsed: unknown,
): FunctionCallArguments | undefined => {
  if (!parsed || typeof parsed !== 'object') {
    return undefined
  }
  if (
    'type' in parsed &&
    parsed.type === 'response.function_call_arguments.done' &&
    'call_id' in parsed &&
    typeof parsed.call_id === 'string' &&
    'name' in parsed &&
    typeof parsed.name === 'string' &&
    'arguments' in parsed &&
    typeof parsed.arguments === 'string'
  ) {
    return {
      argumentsValue: parsed.arguments,
      callId: parsed.call_id,
      name: parsed.name,
    }
  }
  if (
    'type' in parsed &&
    parsed.type === 'response.output_item.done' &&
    'item' in parsed &&
    parsed.item &&
    typeof parsed.item === 'object' &&
    'type' in parsed.item &&
    parsed.item.type === 'function_call' &&
    'call_id' in parsed.item &&
    typeof parsed.item.call_id === 'string' &&
    'name' in parsed.item &&
    typeof parsed.item.name === 'string' &&
    'arguments' in parsed.item &&
    typeof parsed.item.arguments === 'string'
  ) {
    return {
      argumentsValue: parsed.item.arguments,
      callId: parsed.item.call_id,
      name: parsed.item.name,
    }
  }
  return undefined
}

const parseArguments = (value: string): Readonly<Record<string, unknown>> => {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new TypeError('Function tool arguments must be valid JSON.')
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new TypeError('Function tool arguments must be a JSON object.')
  }
  return parsed as Readonly<Record<string, unknown>>
}

const getRequiredString = (
  argumentsValue: Readonly<Record<string, unknown>>,
  name: string,
): string => {
  const value = argumentsValue[name]
  if (typeof value !== 'string') {
    throw new TypeError(`Function tool argument "${name}" must be a string.`)
  }
  return value
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

const readWorkspaceFileTool: FunctionToolDefinition = {
  description:
    'Read a UTF-8 text file from the currently opened workspace. The path must be relative to the workspace folder.',
  name: 'read_workspace_file',
  parameters: {
    additionalProperties: false,
    properties: {
      path: {
        description: 'File path relative to the currently opened workspace',
        type: 'string',
      },
    },
    required: ['path'],
    type: 'object',
  },
  type: 'function',
}

const writeWorkspaceFileTool: FunctionToolDefinition = {
  description:
    'Write UTF-8 text to a file in the currently opened workspace. The path must be relative to the workspace folder.',
  name: 'write_workspace_file',
  parameters: {
    additionalProperties: false,
    properties: {
      content: {
        description: 'Complete UTF-8 text content to write',
        type: 'string',
      },
      path: {
        description: 'File path relative to the currently opened workspace',
        type: 'string',
      },
    },
    required: ['path', 'content'],
    type: 'object',
  },
  type: 'function',
}

export const workspaceFileFunctionTools: readonly FunctionToolDefinition[] = [
  readWorkspaceFileTool,
  writeWorkspaceFileTool,
]

const workspaceFileFunctionToolNames = workspaceFileFunctionTools.map(
  (tool) => tool.name,
)

export const executeWorkspaceFileFunctionToolCall = async (
  functionCallEvent: unknown,
  fileSystemApi?: WorkspaceFileSystemApi,
): Promise<readonly string[] | undefined> => {
  const functionCall = parseFunctionCall(functionCallEvent)
  if (
    !functionCall ||
    !workspaceFileFunctionToolNames.includes(functionCall.name)
  ) {
    return undefined
  }
  let output: unknown
  try {
    const argumentsValue = parseArguments(functionCall.argumentsValue)
    const path = getRequiredString(argumentsValue, 'path')
    if (functionCall.name === 'read_workspace_file') {
      output = await readWorkspaceFile(path, fileSystemApi)
    } else {
      output = await writeWorkspaceFile(
        path,
        getRequiredString(argumentsValue, 'content'),
        fileSystemApi,
      )
    }
  } catch (error) {
    output = { error: getErrorMessage(error) }
  }
  return [
    createToolOutputMessage(functionCall.callId, JSON.stringify(output)),
    createFunctionResultResponseMessage(),
  ]
}
