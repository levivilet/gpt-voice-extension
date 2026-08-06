import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  openBoard,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.dynamic-sidebar-title'
export const skip = 1

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)

  const sidebarTitle = Locator('.SideBarTitleAreaTitle')
  const boardTitle = Locator('.gpt-voiceTitle')
  await expect(sidebarTitle).toHaveText('gpt-voice: Roadmap')
  await expect(boardTitle).toHaveCount(0)
}
