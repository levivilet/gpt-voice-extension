import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.boards'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator, Main }) => {
  await Main.closeAllEditors()
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))
  await connectWithCredentials({ Command, expect, Locator })

  const board = Locator('button[name="board:board-1"]')
  await expect(board).toBeVisible()

  const roadmap = Locator('text=Roadmap')

  await expect(roadmap).toBeVisible()
}
