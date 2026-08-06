import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  openBoard,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.error-board-detail'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, {
    ...createMockData(boards),
    boardDetailErrors: {
      'board-1': 'Cannot load board',
    },
  })
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)

  const error = Locator('text=Cannot load board')
  const board = Locator('button[name="board:board-1"]')
  const cards = Locator('.gpt-voiceCard')

  await expect(error).toBeVisible()
  await expect(board).toBeVisible()
  await expect(cards).toHaveCount(0)
}
