import { expect, test } from '@jest/globals'
import type { gpt-voiceClient } from '../src/parts/gpt-voiceClient/gpt-voiceClient.ts'
import type {
  gpt-voiceBoardDetail,
  gpt-voiceCard,
  gpt-voiceCardMove,
} from '../src/parts/gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../src/parts/gpt-voiceViewState/gpt-voiceViewState.ts'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { handleDropEvent } from '../src/parts/HandleDragEvent/HandleDragEvent.ts'

const credentials = {
  apiKey: 'api-key',
  token: 'token',
}

const initialBoardDetail: gpt-voiceBoardDetail = {
  board: { id: 'board-1', name: 'Roadmap' },
  lists: [
    {
      cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
      id: 'list-1',
      name: 'Todo',
    },
    {
      cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
      id: 'list-2',
      name: 'Doing',
    },
  ],
}

const movedBoardDetail: gpt-voiceBoardDetail = {
  board: initialBoardDetail.board,
  lists: [
    {
      cards: [],
      id: 'list-1',
      name: 'Todo',
    },
    {
      cards: [
        { id: 'card-1', idList: 'list-2', name: 'Plan work' },
        { id: 'card-2', idList: 'list-2', name: 'Build work' },
      ],
      id: 'list-2',
      name: 'Doing',
    },
  ],
}

const createDropContext = (
  moveCard: (
    card: Readonly<gpt-voiceCard>,
    move: Readonly<gpt-voiceCardMove>,
  ) => Promise<gpt-voiceCard>,
  getBoardDetail: () => Promise<gpt-voiceBoardDetail>,
): {
  readonly context: gpt-voiceViewActionContext
  readonly getRerenderCount: () => number
  readonly state: gpt-voiceViewState
} => {
  const state = createInitialState()
  state.boardDetail = initialBoardDetail
  state.credentials = credentials
  state.draggedCardId = 'card-1'
  state.dragTargetListId = 'list-2'
  let rerenderCount = 0
  const client = {
    getBoardDetail,
    moveCard,
  } as unknown as gpt-voiceClient
  const context = {
    client,
    requestRerender(): void {
      rerenderCount++
    },
    state,
  } as unknown as gpt-voiceViewActionContext
  return {
    context,
    getRerenderCount(): number {
      return rerenderCount
    },
    state,
  }
}

const getListCardIds = (
  state: Readonly<gpt-voiceViewState>,
  listId: string,
): readonly string[] => {
  const list = state.boardDetail?.lists.find((item) => item.id === listId)
  return list?.cards.map((card) => card.id) || []
}

test('card drop moves immediately and does not rerender matching server state', async () => {
  const move = Promise.withResolvers<void>()
  let moveCalled = false
  let refreshCalled = false
  const { context, getRerenderCount, state } = createDropContext(
    async (card, cardMove) => {
      moveCalled = true
      await move.promise
      return {
        ...card,
        idList: cardMove.idList,
      }
    },
    async () => {
      refreshCalled = true
      return movedBoardDetail
    },
  )

  const drop = handleDropEvent(context, {
    name: 'list:list-2',
    type: 'drop',
  })

  expect(moveCalled).toBe(true)
  expect(refreshCalled).toBe(false)
  expect(getListCardIds(state, 'list-1')).toEqual([])
  expect(getListCardIds(state, 'list-2')).toEqual(['card-1', 'card-2'])
  expect(state.draggedCardId).toBe('')
  expect(state.dragTargetListId).toBe('')
  expect(getRerenderCount()).toBe(1)

  move.resolve()
  await drop

  expect(refreshCalled).toBe(true)
  expect(getRerenderCount()).toBe(1)
})

test('card drop rerenders when refreshed lists differ from optimistic state', async () => {
  const serverBoardDetail: gpt-voiceBoardDetail = {
    ...movedBoardDetail,
    lists: movedBoardDetail.lists.map((list) => {
      if (list.id !== 'list-2') {
        return list
      }
      return {
        ...list,
        cards: [
          ...list.cards,
          { id: 'card-3', idList: 'list-2', name: 'Server card' },
        ],
      }
    }),
  }
  const { context, getRerenderCount, state } = createDropContext(
    async (card, move) => {
      return {
        ...card,
        idList: move.idList,
      }
    },
    async () => serverBoardDetail,
  )

  await handleDropEvent(context, {
    name: 'list:list-2',
    type: 'drop',
  })

  expect(getListCardIds(state, 'list-2')).toEqual([
    'card-1',
    'card-2',
    'card-3',
  ])
  expect(getRerenderCount()).toBe(2)
})
