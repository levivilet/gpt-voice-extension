import { test, expect } from '@jest/globals'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderButton } from '../src/parts/RenderButton/RenderButton.ts'
import { createRenderState } from '../src/parts/RenderTestHelpers.ts'

test('renderButton - idle state', () => {
  const result = renderButton(createRenderState())

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: 'handleClickStart',
      type: VirtualDomElements.Button,
    },
    text('Start talking'),
  ])
})

test('renderButton - active recording state', () => {
  const result = renderButton(
    createRenderState({
      inProgress: true,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: 'handleClickStart',
      type: VirtualDomElements.Button,
    },
    text('Stop talking'),
  ])
})
