import { test, expect } from '@jest/globals'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { ITranscript } from '../src/parts/CreateInstance/CreateInstance.ts'
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
      transcripts: [transcript],
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
      transcripts: [userTranscript, aiTranscript],
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
