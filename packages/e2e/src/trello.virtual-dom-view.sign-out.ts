import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoards,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.sign-out'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))
  await connectWithCredentials({ Command, expect, Locator })

  const logout = Locator('button[title="Sign Out"]')
  await expect(logout).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await logout.click()

  const apiKey = Locator('input[name="apiKey"]')
  const token = Locator('input[name="token"]')
  const board = Locator('button[name="board:board-1"]')

  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
  await expect(board).toBeHidden()
}
