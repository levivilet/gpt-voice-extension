import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  createMockData,
  openBoard,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.board-detail-zero-cards'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  const lists = [createList('list-1', 'Todo', [])]
  await useMockDataAndShowgpt-voice(
    Command,
    createMockData(boards, {
      'board-1': createBoardDetail(boards[0], lists),
    }),
  )
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)

  const list = Locator('.gpt-voiceList')
  const noCards = Locator('text=No cards')
  const cards = Locator('.gpt-voiceCard')

  await expect(list).toHaveCount(1)
  await expect(noCards).toBeVisible()
  await expect(cards).toHaveCount(0)
}
