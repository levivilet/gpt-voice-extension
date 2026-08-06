import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.boards-many'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(100)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))
  await connectWithCredentials({ Command, expect, Locator })

  const boardButtons = Locator('.gpt-voiceBoardButton')
  const roadmap = Locator('button[name="board:board-1"]')
  const lastBoard = Locator('button[name="board:board-100"]')

  await expect(boardButtons).toHaveCount(100)
  await expect(roadmap).toHaveText('Roadmap')
  await expect(lastBoard).toHaveText('Board 100')
}
