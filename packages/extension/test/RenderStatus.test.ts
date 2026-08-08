import { test, expect } from '@jest/globals'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderStatus } from '../src/parts/RenderStatus/RenderStatus.ts'
import { createRenderState } from '../src/parts/RenderTestHelpers.ts'

test('renderStatus - idle', () => {
  const result = renderStatus(createRenderState())

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('idle'),
  ])
})

test('renderStatus - in progress', () => {
  const result = renderStatus(
    createRenderState({
      inProgress: true,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('In Progress'),
  ])
})

test('renderStatus - creating token', () => {
  const result = renderStatus(
    createRenderState({
      isCreatingToken: true,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('Creating token'),
  ])
})

test('renderStatus - token error', () => {
  const result = renderStatus(
    createRenderState({
      tokenError: 'invalid key',
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('invalid key'),
  ])
})
