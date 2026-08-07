import { test, expect } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { createRenderState } from './RenderTestHelpers.ts'
import { renderStage } from '../src/parts/RenderStage/RenderStage.ts'

test('renderStage - idle bubble has default class', () => {
  const result = renderStage(
    createRenderState(),
  )

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
      className: 'GptVoiceBubble listening',
      type: VirtualDomElements.Div,
    },
  ])
})
