import { test, expect } from '@jest/globals'
import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../src/parts/DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { renderButton } from '../src/parts/RenderButton/RenderButton.ts'
import { createRenderState } from '../src/parts/RenderTestHelpers.ts'

test('renderButton - idle state', () => {
  const result = renderButton(createRenderState())

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: DomEventListenerFunctions.HandleClickStart,
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
      onClick: DomEventListenerFunctions.HandleClickStart,
      type: VirtualDomElements.Button,
    },
    text('Stop talking'),
  ])
})

test('renderButton - disabled when creating token', () => {
  const result = renderButton(
    createRenderState({
      isCreatingToken: true,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceButton',
      disabled: true,
      id: 'toggle',
      onClick: DomEventListenerFunctions.HandleClickStart,
      type: VirtualDomElements.Button,
    },
    text('Creating token'),
  ])
})

test('renderButton - disabled when saving API key', () => {
  const result = renderButton(
    createRenderState({
      isSavingApiKey: true,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceButton',
      disabled: true,
      id: 'toggle',
      onClick: DomEventListenerFunctions.HandleClickStart,
      type: VirtualDomElements.Button,
    },
    text('Saving key'),
  ])
})

test('renderButton - disabled when API key has not been saved', () => {
  const result = renderButton(
    createRenderState({
      hasOpenAiApiKey: false,
    }),
  )

  expect(result).toEqual([
    {
      childCount: 1,
      className: 'GptVoiceButton',
      disabled: true,
      id: 'toggle',
      onClick: DomEventListenerFunctions.HandleClickStart,
      type: VirtualDomElements.Button,
    },
    text('Start talking'),
  ])
})
