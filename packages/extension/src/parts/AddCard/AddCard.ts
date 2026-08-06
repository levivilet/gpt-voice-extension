import type { gpt-voiceCard, gpt-voiceList } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const addCardPrefix = 'addCard:'

const findList = (
  state: Readonly<gpt-voiceViewState>,
  listId: string,
): gpt-voiceList | undefined => {
  return state.boardDetail?.lists.find((list) => {
    return list.id === listId
  })
}

const appendCardToList = (
  state: Readonly<gpt-voiceViewState>,
  listId: string,
  card: gpt-voiceCard,
): void => {
  if (!state.boardDetail) {
    return
  }
  const mutableState = state as gpt-voiceViewState
  mutableState.boardDetail = {
    ...state.boardDetail,
    lists: state.boardDetail.lists.map((list) => {
      if (list.id !== listId) {
        return list
      }
      return {
        ...list,
        cards: [...list.cards, card],
      }
    }),
  }
}

export const startAddCard = (
  context: Readonly<gpt-voiceViewActionContext>,
  listId: string,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.addingCardListId = listId
  state.focusedName = `newCardTitle:${listId}`
  state.savingNewCard = false
  state.error = ''
  requestRerender()
}

export const cancelAddCard = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.addingCardListId = ''
  state.savingNewCard = false
  state.error = ''
  requestRerender()
}

export const submitAddCard = async (
  context: Readonly<gpt-voiceViewActionContext>,
  formName: string | undefined,
): Promise<void> => {
  if (!formName?.startsWith(addCardPrefix)) {
    return
  }
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || !state.boardDetail || state.savingNewCard) {
    return
  }
  const listId = formName.slice(addCardPrefix.length)
  const list = findList(state, listId)
  if (!list) {
    return
  }
  const name = state.draftNewCardTitle.trim()
  state.addingCardListId = listId
  if (!name) {
    state.error = gpt-voiceStrings.cardTitleRequired()
    requestRerender()
    return
  }
  state.savingNewCard = true
  state.focusedName = ''
  state.error = ''
  requestRerender()
  try {
    const card = await client.createCard(
      list,
      {
        name,
        pos: 'bottom',
      },
      state.credentials,
    )
    appendCardToList(state, listId, card)
    state.addingCardListId = listId
    state.draftNewCardTitle = ''
    state.focusedName = `newCardTitle:${listId}`
    state.error = ''
  } catch (error) {
    state.focusedName = `newCardTitle:${listId}`
    state.error = getErrorMessage(error)
  }
  state.savingNewCard = false
  requestRerender()
}
