import { expect, test } from '@jest/globals'
import type {
  gpt-voiceBoardDetail,
  gpt-voiceCard,
} from '../src/parts/gpt-voiceTypes/gpt-voiceTypes.ts'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { moveBoardDetailCard } from '../src/parts/MoveBoardDetailCard/MoveBoardDetailCard.ts'

const card: gpt-voiceCard = {
  id: 'card-1',
  idList: 'list-2',
  name: 'Plan work',
}

const otherCard: gpt-voiceCard = {
  id: 'card-2',
  idList: 'list-2',
  name: 'Build work',
}

const createBoardDetail = (): gpt-voiceBoardDetail => {
  return {
    board: {
      id: 'board-1',
      name: 'Roadmap',
    },
    lists: [
      {
        cards: [
          {
            ...card,
            idList: 'list-1',
          },
        ],
        id: 'list-1',
        name: 'Todo',
      },
      {
        cards: [otherCard],
        id: 'list-2',
        name: 'Doing',
      },
    ],
  }
}

test('moveBoardDetailCard does nothing without board detail', () => {
  const state = createInitialState()

  moveBoardDetailCard(state, card, 'list-2', 'top')

  expect(state.boardDetail).toBeUndefined()
})

test('moveBoardDetailCard moves a card to the top of the target list', () => {
  const state = createInitialState()
  state.boardDetail = createBoardDetail()

  moveBoardDetailCard(state, card, 'list-2', 'top')

  expect(state.boardDetail?.lists).toEqual([
    {
      cards: [],
      id: 'list-1',
      name: 'Todo',
    },
    {
      cards: [card, otherCard],
      id: 'list-2',
      name: 'Doing',
    },
  ])
})

test('moveBoardDetailCard moves a card to the bottom of the target list', () => {
  const state = createInitialState()
  state.boardDetail = createBoardDetail()

  moveBoardDetailCard(state, card, 'list-2', 'bottom')

  expect(state.boardDetail?.lists[1]?.cards).toEqual([otherCard, card])
})
