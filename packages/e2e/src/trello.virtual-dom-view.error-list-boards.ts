import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.error-list-boards'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, {
    boards,
    listBoardsError: 'Cannot list boards',
  })
  await connectWithCredentials({ Command, expect, Locator })

  const error = Locator('text=Cannot list boards')
  const board = Locator('button[name="board:board-1"]')

  await expect(error).toBeVisible()
  await expect(board).toBeHidden()
}
