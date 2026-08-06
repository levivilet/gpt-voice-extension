// @ts-nocheck

import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.virtual-dom-view.list-create'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  // TODO there might be a race condition, where it tries to restore the old board
  // and at the same time use mock data

  // arrange
  await Command.executeExtensionCommand('gpt-voice.test.useMockData', {
    boardDetails: {},
    boards: [],
    cardDetails: {},
  })

  // act
  await Command.executeExtensionCommand('gpt-voice.openMockBoard', {
    id: 'abc',
    name: 'abc',
  })

  // assert
  const boards = Locator('.gpt-voiceBoards')
  await expect(boards).toBeVisible()
  await expect(boards).toHaveText(`RefreshSign outBoardsNo boards found`)
}
