import type { FunctionToolDefinition } from '../FunctionToolRegistry/FunctionToolRegistry.ts'
import * as Rpc from '../Rpc/Rpc.ts'

interface FunctionCallArguments {
  readonly argumentsValue: string
  readonly callId: string
  readonly name: string
}

interface PanelApi {
  readonly closePanel: () => Promise<void>
  readonly openPanel: (view?: string) => Promise<void>
}

const defaultApi: PanelApi = {
  closePanel: () => Rpc.invoke<void>('Panel.close'),
  openPanel: (view) => Rpc.invoke<void>('Panel.open', view),
}

const panelViewIds = {
  'debug-console': 'Debug Console',
  output: 'Output',
  ports: 'Ports',
  problems: 'Problems',
  terminal: 'Terminals',
} as const

type PanelAction = 'close' | 'open'
type PanelView = keyof typeof panelViewIds

const panelTool: FunctionToolDefinition = {
  description:
    'Open or close the LVCE Editor panel, and optionally select its terminal, problems, output, debug console, or ports view.',
  name: 'set_panel',
  parameters: {
    additionalProperties: false,
    properties: {
      action: {
        description: 'Whether to open or close the panel.',
        enum: ['open', 'close'],
        type: 'string',
      },
      view: {
        description:
          'Panel view to select when opening. Omit to keep the current panel view.',
        enum: ['terminal', 'problems', 'output', 'debug-console', 'ports'],
        type: 'string',
      },
    },
    required: ['action'],
    type: 'object',
  },
  type: 'function',
}

export const panelFunctionTools: readonly FunctionToolDefinition[] = [panelTool]

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
    parsed.name === 'set_panel' &&
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
    parsed.item.name === 'set_panel' &&
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

const getAction = (
  argumentsValue: Readonly<Record<string, unknown>>,
): PanelAction => {
  const { action } = argumentsValue
  if (action !== 'open' && action !== 'close') {
    throw new TypeError(
      'Function tool argument "action" must be "open" or "close".',
    )
  }
  return action
}

const getView = (
  argumentsValue: Readonly<Record<string, unknown>>,
): PanelView | undefined => {
  const { view } = argumentsValue
  if (view === undefined) {
    return undefined
  }
  if (typeof view !== 'string' || !(view in panelViewIds)) {
    throw new TypeError(
      'Function tool argument "view" must be "terminal", "problems", "output", "debug-console", or "ports".',
    )
  }
  return view as PanelView
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
  return JSON.stringify({ type: 'response.create' })
}

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error)
}

export const executePanelFunctionToolCall = async (
  functionCallEvent: unknown,
  api: PanelApi = defaultApi,
): Promise<readonly string[] | undefined> => {
  const functionCall = parseFunctionCall(functionCallEvent)
  if (!functionCall) {
    return undefined
  }
  let output: unknown
  try {
    const argumentsValue = parseArguments(functionCall.argumentsValue)
    const action = getAction(argumentsValue)
    const view = getView(argumentsValue)
    if (action === 'close') {
      if (view !== undefined) {
        throw new TypeError(
          'Function tool argument "view" cannot be used when closing the panel.',
        )
      }
      await api.closePanel()
      output = { action, success: true }
    } else {
      await api.openPanel(view === undefined ? undefined : panelViewIds[view])
      output = { action, success: true, view }
    }
  } catch (error) {
    output = {
      error: getErrorMessage(error),
      hint: 'Use {"action":"open"} to show the current panel view, {"action":"open","view":"terminal"} to select a view, or {"action":"close"} to hide the panel.',
      tool: functionCall.name,
    }
  }
  return [
    createToolOutputMessage(functionCall.callId, JSON.stringify(output)),
    createFunctionResultResponseMessage(),
  ]
}
