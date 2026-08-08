import { getFakeWeather } from '../FunctionCalls/FakeWeather.ts'
import {
  readWorkspaceFile,
  type WorkspaceFileSystemApi,
  writeWorkspaceFile,
} from '../WorkspaceFileSystem/WorkspaceFileSystem.ts'

type FunctionCallArguments = {
  readonly argumentsValue: Readonly<Record<string, unknown>>
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

const parseArgs = (value: unknown): Record<string, unknown> | undefined => {
  if (typeof value !== 'string') {
    return undefined
  }
  try {
    const parsed = JSON.parse(value)
    if (typeof parsed !== 'object' || parsed === null) {
      return undefined
    }
    return parsed as Record<string, unknown>
  } catch {
    return undefined
  }
}

const parseFunctionCall = (parsed: any): FunctionCallArguments | undefined => {
  if (!parsed || typeof parsed !== 'object') {
    return undefined
  }

  if (parsed.type === 'response.function_call_arguments.done') {
    const args = parseArgs(parsed.arguments)
    if (
      typeof parsed.call_id === 'string' &&
      typeof parsed.name === 'string' &&
      args
    ) {
      return {
        argumentsValue: args,
        callId: parsed.call_id,
        name: parsed.name,
      }
    }
    return undefined
  }

  if (
    parsed.type === 'response.output_item.done' &&
    parsed.item &&
    typeof parsed.item === 'object' &&
    parsed.item.type === 'function_call' &&
    typeof parsed.item.call_id === 'string' &&
    typeof parsed.item.name === 'string' &&
    typeof parsed.item.arguments === 'string'
  ) {
    const args = parseArgs(parsed.item.arguments)
    if (args) {
      return {
        argumentsValue: args,
        callId: parsed.item.call_id,
        name: parsed.item.name,
      }
    }
  }

  return undefined
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

const executeFunctionTool = async (
  functionCall: FunctionCallArguments,
  fileSystemApi?: WorkspaceFileSystemApi,
): Promise<unknown> => {
  const { argumentsValue, name } = functionCall
  switch (name) {
    case 'getweather':
      return getFakeWeather(getRequiredString(argumentsValue, 'location'))
    case 'read_workspace_file':
      return readWorkspaceFile(
        getRequiredString(argumentsValue, 'path'),
        fileSystemApi,
      )
    case 'write_workspace_file':
      return writeWorkspaceFile(
        getRequiredString(argumentsValue, 'path'),
        getRequiredString(argumentsValue, 'content'),
        fileSystemApi,
      )
    default:
      return undefined
  }
}

const supportedFunctionToolNames: readonly string[] = [
  'getweather',
  'read_workspace_file',
  'write_workspace_file',
]

const isSupportedFunctionTool = (name: string): boolean => {
  return supportedFunctionToolNames.includes(name)
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return String(error)
}

export const handleFunctionCall = async (
  parsed: any,
  sendToDataChannel: (data: string) => Promise<void>,
  fileSystemApi?: WorkspaceFileSystemApi,
): Promise<void> => {
  const functionCall = parseFunctionCall(parsed)
  if (!functionCall || !isSupportedFunctionTool(functionCall.name)) {
    return
  }

  let output: unknown
  try {
    output = await executeFunctionTool(functionCall, fileSystemApi)
  } catch (error) {
    output = { error: getErrorMessage(error) }
  }
  await sendToDataChannel(
    createToolOutputMessage(functionCall.callId, JSON.stringify(output)),
  )
  await sendToDataChannel(createFunctionResultResponseMessage())
}
