import { expect, test } from '@jest/globals'
import type { gpt-voiceCardDetail } from '../src/parts/gpt-voiceTypes/gpt-voiceTypes.ts'
import { createInitialState } from '../src/parts/CreateInitialState/CreateInitialState.ts'
import { updateSelectedCard } from '../src/parts/UpdateSelectedCard/UpdateSelectedCard.ts'

const selectedCardDetail: gpt-voiceCardDetail = {
  attachments: [
    {
      id: 'attachment-1',
      name: 'Plan',
    },
  ],
  card: {
    desc: 'Original description',
    id: 'card-1',
    idList: 'list-1',
    name: 'Plan work',
  },
  comments: [],
}

test('updateSelectedCard leaves a different selected card unchanged', () => {
  const state = createInitialState()
  state.selectedCardDetail = selectedCardDetail

  updateSelectedCard(state, {
    id: 'card-2',
    name: 'Other work',
  })

  expect(state.selectedCardDetail).toBe(selectedCardDetail)
})

test('updateSelectedCard merges the matching card into selected detail', () => {
  const state = createInitialState()
  state.selectedCardDetail = selectedCardDetail

  updateSelectedCard(state, {
    id: 'card-1',
    idList: 'list-2',
    name: 'Updated plan',
  })

  expect(state.selectedCardDetail).toEqual({
    attachments: selectedCardDetail.attachments,
    card: {
      desc: 'Original description',
      id: 'card-1',
      idList: 'list-2',
      name: 'Updated plan',
    },
    comments: selectedCardDetail.comments,
  })
})
