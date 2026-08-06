import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.boards-three'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(3)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))
  await connectWithCredentials({ Command, expect, Locator })

  const boardButtons = Locator('.gpt-voiceBoardButton')
  const roadmap = Locator('button[name="board:board-1"]')
  const boardTwo = Locator('button[name="board:board-2"]')
  const boardThree = Locator('button[name="board:board-3"]')

  await expect(boardButtons).toHaveCount(3)
  await expect(roadmap).toHaveText('Roadmap')
  await expect(boardTwo).toHaveText('Board 2')
  await expect(boardThree).toHaveText('Board 3')
}
