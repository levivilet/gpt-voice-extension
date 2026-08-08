import { expect, jest, test } from '@jest/globals'
import {
  executePanelFunctionToolCall,
  panelFunctionTools,
} from '../src/parts/PanelFunctionTools/PanelFunctionTools.ts'

const getToolOutput = (messages: readonly string[]): unknown => {
  const message = JSON.parse(messages[0] || '{}')
  return JSON.parse(message.item.output)
}

test('exposes the set panel tool definition', () => {
  expect(panelFunctionTools).toEqual([
    expect.objectContaining({
      name: 'set_panel',
      parameters: expect.objectContaining({ required: ['action'] }),
      type: 'function',
    }),
  ])
})

test.each([
  ['terminal', 'Terminals'],
  ['problems', 'Problems'],
  ['output', 'Output'],
  ['debug-console', 'Debug Console'],
  ['ports', 'Ports'],
])('opens the %s panel view', async (view, panelViewId) => {
  const openPanel = jest.fn<(view?: string) => Promise<void>>(
    async () => undefined,
  )
  const messages = await executePanelFunctionToolCall(
    {
      arguments: JSON.stringify({ action: 'open', view }),
      call_id: 'panel-call',
      name: 'set_panel',
      type: 'response.function_call_arguments.done',
    },
    {
      closePanel: jest.fn(async () => undefined),
      openPanel,
    },
  )

  expect(openPanel).toHaveBeenCalledWith(panelViewId)
  expect(getToolOutput(messages || [])).toEqual({
    action: 'open',
    success: true,
    view,
  })
})

test('opens the current panel view when no view is specified', async () => {
  const openPanel = jest.fn<(view?: string) => Promise<void>>(
    async () => undefined,
  )
  const messages = await executePanelFunctionToolCall(
    {
      item: {
        arguments: '{"action":"open"}',
        call_id: 'panel-call',
        name: 'set_panel',
        type: 'function_call',
      },
      type: 'response.output_item.done',
    },
    {
      closePanel: jest.fn(async () => undefined),
      openPanel,
    },
  )

  expect(openPanel).toHaveBeenCalledWith(undefined)
  expect(getToolOutput(messages || [])).toEqual({
    action: 'open',
    success: true,
  })
})

test('closes the panel', async () => {
  const closePanel = jest.fn(async () => undefined)
  const messages = await executePanelFunctionToolCall(
    {
      arguments: '{"action":"close"}',
      call_id: 'panel-call',
      name: 'set_panel',
      type: 'response.function_call_arguments.done',
    },
    {
      closePanel,
      openPanel: jest.fn(async () => undefined),
    },
  )

  expect(closePanel).toHaveBeenCalledWith()
  expect(getToolOutput(messages || [])).toEqual({
    action: 'close',
    success: true,
  })
})

test.each([
  ['{}', 'Function tool argument "action" must be "open" or "close".'],
  [
    '{"action":"toggle"}',
    'Function tool argument "action" must be "open" or "close".',
  ],
  [
    '{"action":"open","view":"search"}',
    'Function tool argument "view" must be "terminal", "problems", "output", "debug-console", or "ports".',
  ],
  [
    '{"action":"close","view":"terminal"}',
    'Function tool argument "view" cannot be used when closing the panel.',
  ],
  ['[]', 'Function tool arguments must be a JSON object.'],
  ['{', 'Function tool arguments must be valid JSON.'],
])('returns tool errors to the model for %s', async (argumentsValue, error) => {
  const closePanel = jest.fn(async () => undefined)
  const openPanel = jest.fn<(view?: string) => Promise<void>>(
    async () => undefined,
  )
  const messages = await executePanelFunctionToolCall(
    {
      arguments: argumentsValue,
      call_id: 'panel-call',
      name: 'set_panel',
      type: 'response.function_call_arguments.done',
    },
    { closePanel, openPanel },
  )

  expect(closePanel).not.toHaveBeenCalled()
  expect(openPanel).not.toHaveBeenCalled()
  expect(getToolOutput(messages || [])).toEqual({
    error,
    hint: 'Use {"action":"open"} to show the current panel view, {"action":"open","view":"terminal"} to select a view, or {"action":"close"} to hide the panel.',
    tool: 'set_panel',
  })
})

test('returns panel API failures to the model', async () => {
  const messages = await executePanelFunctionToolCall(
    {
      arguments: '{"action":"open","view":"terminal"}',
      call_id: 'panel-call',
      name: 'set_panel',
      type: 'response.function_call_arguments.done',
    },
    {
      closePanel: jest.fn(async () => undefined),
      openPanel: jest.fn(async () => {
        throw new Error('Panel unavailable')
      }),
    },
  )

  expect(getToolOutput(messages || [])).toEqual({
    error: 'Panel unavailable',
    hint: 'Use {"action":"open"} to show the current panel view, {"action":"open","view":"terminal"} to select a view, or {"action":"close"} to hide the panel.',
    tool: 'set_panel',
  })
})

const nonPanelFunctionCalls: readonly unknown[] = [
  undefined,
  null,
  {},
  {
    arguments: '{}',
    call_id: 'call',
    name: 'read_workspace_file',
    type: 'response.function_call_arguments.done',
  },
  { item: {}, type: 'response.output_item.done' },
]

test.each(nonPanelFunctionCalls)(
  'ignores non-panel function call %#',
  async (event) => {
    await expect(executePanelFunctionToolCall(event)).resolves.toBeUndefined()
  },
)
