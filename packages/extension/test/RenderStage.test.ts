import { test, expect } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { mergeClassNames } from '../src/parts/MergeClassNames/MergeClassNames.ts'
import { renderStage } from '../src/parts/RenderStage/RenderStage.ts'
import { createRenderState } from '../src/parts/RenderTestHelpers.ts'

test('renderStage - idle bubble has default class', () => {
  const result = renderStage(createRenderState())

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceStage',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'GptVoiceBubble',
      type: VirtualDomElements.Div,
    },
  ])
})

test('renderStage - in progress bubble has listening class', () => {
  const result = renderStage(
    createRenderState({
      inProgress: true,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceStage',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: mergeClassNames('GptVoiceBubble', 'listening'),
      type: VirtualDomElements.Div,
    },
  ])
})
