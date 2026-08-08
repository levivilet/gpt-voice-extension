import { test, expect } from '@jest/globals'
import { renderEventListeners } from '../src/parts/RenderEventListeners/RenderEventListeners.ts'

test('renderEventListeners - returns all listeners', () => {
  const eventListeners = renderEventListeners()
  expect(eventListeners).toEqual([
    {
      name: 'handleOpenAiApiKeyInput',
      params: ['handleOpenAiApiKeyInput', 'event.target.value'],
    },
    {
      name: 'handleClearOpenAiApiKey',
      params: ['handleClearOpenAiApiKey'],
    },
    {
      name: 'handleSaveOpenAiApiKey',
      params: ['handleSaveOpenAiApiKey'],
    },
    {
      name: 'handleClickStart',
      params: ['handleClickStart'],
    },
    {
      name: 'setRealtimeModelMini',
      params: ['setRealtimeModelMini'],
    },
    {
      name: 'setRealtimeModelStandard',
      params: ['setRealtimeModelStandard'],
    },
  ])
})
