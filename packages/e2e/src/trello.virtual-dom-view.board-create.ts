// @ts-nocheck
import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.virtual-dom-view.list-create'
export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
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
  // const list = Locator('[name="listTitle:created-list-1"]')
  // await expect(list).toBeVisible()
}
