import { test, expect } from '@jest/globals'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type {
  IToolCallMessage,
  ITranscript,
} from '../src/parts/CreateInstance/CreateInstance.ts'
import * as DomEventListenerFunctions from '../src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { mergeClassNames } from '../src/parts/MergeClassNames/MergeClassNames.ts'
import { createRenderState } from '../src/parts/RenderTestHelpers.ts'
import { renderTranscript } from '../src/parts/RenderTranscript/RenderTranscript.ts'

test('renderTranscript - empty list', () => {
  const result = renderTranscript(createRenderState())

  expect(result).toEqual([
    {
      childCount: 0,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
  ])
})

test('renderTranscript - single user transcript', () => {
  const transcript: ITranscript = {
    id: 'user-1',
    text: 'Hello',
    type: 'user',
  }
  const result = renderTranscript(
    createRenderState({
      messages: [transcript],
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: mergeClassNames(
        'GptVoiceTranscriptItem',
        'GptVoiceTranscriptItemUser',
      ),
      type: VirtualDomElements.Div,
    },
    text('Hello'),
  ])
})

test('renderTranscript - mixed transcript item types', () => {
  const userTranscript: ITranscript = {
    id: 'user-2',
    text: 'Hey',
    type: 'user',
  }
  const aiTranscript: ITranscript = {
    id: 'ai-1',
    text: 'Hi there',
    type: 'ai',
  }
  const result = renderTranscript(
    createRenderState({
      messages: [userTranscript, aiTranscript],
    }),
  )

  expect(result).toEqual([
    {
      childCount: 2,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: mergeClassNames(
        'GptVoiceTranscriptItem',
        'GptVoiceTranscriptItemUser',
      ),
      type: VirtualDomElements.Div,
    },
    text('Hey'),
    {
      childCount: 1,
      className: mergeClassNames(
        'GptVoiceTranscriptItem',
        'GptVoiceTranscriptItemAi',
      ),
      type: VirtualDomElements.Div,
    },
    text('Hi there'),
  ])
})

const createToolCall = (
  overrides: Partial<IToolCallMessage> = {},
): IToolCallMessage => ({
  argumentsValue: '{"path":"src"}',
  expanded: false,
  id: 'call-1',
  name: 'list_workspace_directory',
  output: '{"files":["a.ts"]}',
  status: 'completed',
  type: 'tool',
  ...overrides,
})

test('renderTranscript - collapsed completed tool call', () => {
  const result = renderTranscript(
    createRenderState({ messages: [createToolCall()] }),
  )

  expect(result).toContainEqual({
    ariaExpanded: false,
    childCount: 3,
    className: 'GptVoiceToolCallButton',
    name: 'call-1',
    onClick: DomEventListenerFunctions.ToggleToolCall,
    type: VirtualDomElements.Button,
  })
  expect(result).toContainEqual(text('✓'))
  expect(result).toContainEqual(text('Ran list_workspace_directory'))
  expect(result).not.toContainEqual(text('Arguments'))
})

test('renderTranscript - expanded completed tool call', () => {
  const result = renderTranscript(
    createRenderState({
      messages: [createToolCall({ expanded: true })],
    }),
  )

  expect(result).toContainEqual(text('Arguments'))
  expect(result).toContainEqual(text('{\n  "path": "src"\n}'))
  expect(result).toContainEqual(text('Output'))
  expect(result).toContainEqual(text('{\n  "files": [\n    "a.ts"\n  ]\n}'))
  expect(result).toContainEqual(text('⌃'))
})

test('renderTranscript - in-progress and failed tool calls', () => {
  const result = renderTranscript(
    createRenderState({
      messages: [
        createToolCall({ expanded: true, status: 'in-progress' }),
        createToolCall({ id: 'call-2', status: 'failed' }),
      ],
    }),
  )

  expect(result).toContainEqual(text('●'))
  expect(result).toContainEqual(text('Running list_workspace_directory…'))
  expect(result).toContainEqual(text('Waiting for tool output…'))
  expect(result).toContainEqual(text('!'))
  expect(result).toContainEqual(text('Failed list_workspace_directory'))
})
