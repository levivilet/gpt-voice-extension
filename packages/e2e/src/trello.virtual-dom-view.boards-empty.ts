import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.boards-empty'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  await useMockDataAndShowgpt-voice(Command, createMockData([]))
  await connectWithCredentials({ Command, expect, Locator })

  const noBoards = Locator('text=No boards found')
  const boardButtons = Locator('.gpt-voiceBoardButton')

  await expect(noBoards).toBeVisible()
  await expect(boardButtons).toHaveCount(0)
}
