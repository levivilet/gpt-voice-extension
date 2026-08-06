import { expect, test } from '@jest/globals'
import type {
  gpt-voiceBoardDetail,
  gpt-voiceCard,
} from '../src/parts/gpt-voiceTypes/gpt-voiceTypes.ts'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { getCardListId } from '../src/parts/GetCardListId/GetCardListId.ts'

const card: gpt-voiceCard = {
  id: 'card-1',
  name: 'Plan work',
}

const boardDetail: gpt-voiceBoardDetail = {
  board: {
    id: 'board-1',
    name: 'Roadmap',
  },
  lists: [
    {
      cards: [card],
      id: 'list-1',
      name: 'Todo',
    },
  ],
}

test('getCardListId returns the card list id when present', () => {
  const state = createInitialState()

  expect(
    getCardListId(state, {
      ...card,
      idList: 'list-from-card',
    }),
  ).toBe('list-from-card')
})

test('getCardListId finds the containing board list', () => {
  const state = createInitialState()
  state.boardDetail = boardDetail

  expect(getCardListId(state, card)).toBe('list-1')
})

test('getCardListId returns an empty string when the card is not in a list', () => {
  const state = createInitialState()

  expect(getCardListId(state, card)).toBe('')
})
