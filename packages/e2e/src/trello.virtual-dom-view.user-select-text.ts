import type { Test } from '@lvce-editor/test-with-playwright'
import {
  createBoards,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.user-select-text'

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))

  const welcomeText = Locator('.gpt-voiceWelcomeText')
  await expect(welcomeText).toBeVisible()
  await expect(welcomeText).toHaveCSS('user-select', 'text')
}
