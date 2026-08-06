import type { Test } from '@lvce-editor/test-with-playwright'
import {
  connectWithCredentials,
  createBoardDetail,
  createBoards,
  createList,
  openBoard,
  openCard,
  useMockDataAndShowgpt-voice,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.card-detail-popup'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('Preferences.update', {
    'gpt-voice.cardDetailPopupEnabled': true,
  })

  const boards = createBoards(1)
  const card = { id: 'card-1', name: 'Plan work' }
  const boardDetails = {
    'board-1': createBoardDetail(boards[0], [
      createList('list-1', 'Todo', [card]),
    ]),
  }
  await useMockDataAndShowgpt-voice(Command, {
    boardDetails,
    boards,
    cardDetails: {
      'card-1': {
        attachments: [],
        card,
        comments: [],
      },
    },
  })
  await connectWithCredentials({ Command, expect, Locator })
  await openBoard(Command, Locator, expect)
  await openCard(Command, Locator, expect)

  const popup = Locator('.gpt-voiceCardDetailPopup')
  const popupPanel = Locator('.gpt-voiceCardDetailPanelPopup')
  const resizeSash = Locator('.gpt-voiceCardDetailResizeSash')
  await expect(popup).toBeVisible()
  await expect(popupPanel).toBeVisible()
  await expect(resizeSash).toHaveCount(0)

  await Command.execute('Preferences.update', {
    'gpt-voice.cardDetailPopupEnabled': false,
  })
}
