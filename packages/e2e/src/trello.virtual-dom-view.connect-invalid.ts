import type { Test } from '@lvce-editor/test-with-playwright'
import {
  createBoards,
  createMockData,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.connect-invalid'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  const boards = createBoards(1)
  await useMockDataAndShowgpt-voice(Command, createMockData(boards))

  const connect = Locator('button[name="connect"]')
  await expect(connect).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await connect.click()
  await Command.execute('Timeout.sleep', 100)

  const error = Locator('text=Enter an API key and token.')
  await expect(error).toBeVisible()
}
