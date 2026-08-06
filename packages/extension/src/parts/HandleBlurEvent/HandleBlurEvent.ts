import type { ViewEvent } from '@lvce-editor/api'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { cancelAddCard } from '../AddCard/AddCard.ts'
import { cancelAddList } from '../AddList/AddList.ts'
import { closeCardLabelPicker } from '../CardLabelPicker/CardLabelPicker.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import { saveCardDetail } from '../SaveCardDetail/SaveCardDetail.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'
import { updateBoardDetailCard } from '../UpdateBoardDetailCard/UpdateBoardDetailCard.ts'
import { updateBoardDetailList } from '../UpdateBoardDetailList/UpdateBoardDetailList.ts'

const listTitlePrefix = 'listTitle:'

const handleCardTitleBlur = async (
  context: Readonly<gpt-voiceViewActionContext>,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || !state.selectedCardDetail) {
    return
  }
  const { card } = state.selectedCardDetail
  const name = state.draftCardTitle.trim()
  state.editingCardTitle = false
  if (!name) {
    state.draftCardTitle = card.name
    state.error = gpt-voiceStrings.cardTitleRequired()
    requestRerender()
    return
  }
  if (name === card.name) {
    state.draftCardTitle = card.name
    requestRerender()
    return
  }
  state.error = ''
  try {
    const updatedCard = await client.updateCard(
      card,
      {
        desc: card.desc || '',
        name,
      },
      state.credentials,
    )
    const mergedCard = {
      ...card,
      ...updatedCard,
    }
    state.selectedCardDetail = {
      ...state.selectedCardDetail,
      card: mergedCard,
    }
    state.draftCardTitle = mergedCard.name
    state.draftCardDescription = mergedCard.desc || ''
    updateBoardDetailCard(state, mergedCard)
  } catch (error) {
    state.draftCardTitle = card.name
    state.error = getErrorMessage(error)
  }
  requestRerender()
}

const handleListTitleBlur = async (
  context: Readonly<gpt-voiceViewActionContext>,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  if (!event.name?.startsWith(listTitlePrefix)) {
    return
  }
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || !state.boardDetail) {
    return
  }
  const listId = event.name.slice(listTitlePrefix.length)
  const list = state.boardDetail.lists.find((item) => {
    return item.id === listId
  })
  if (!list) {
    return
  }
  const draft = state.draftListTitles[listId] ?? list.name
  const name = draft.trim()
  if (!name) {
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: list.name,
    }
    state.error = gpt-voiceStrings.listTitleRequired()
    requestRerender()
    return
  }
  if (name === list.name) {
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: list.name,
    }
    return
  }
  state.error = ''
  try {
    const updatedList = await client.updateList(
      list,
      {
        name,
      },
      state.credentials,
    )
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: updatedList.name,
    }
    updateBoardDetailList(state, updatedList)
  } catch (error) {
    state.draftListTitles = {
      ...state.draftListTitles,
      [listId]: list.name,
    }
    state.error = getErrorMessage(error)
  }
  requestRerender()
}

export const handleBlurEvent = async (
  context: Readonly<gpt-voiceViewActionContext>,
  event: Readonly<ViewEvent>,
): Promise<void> => {
  if (event.name?.startsWith('newCardTitle:')) {
    if (context.state.savingNewCard) {
      return
    }
    cancelAddCard(context)
    return
  }
  if (event.name === 'newListTitle') {
    cancelAddList(context)
    return
  }
  if (event.name === 'cardTitle') {
    await handleCardTitleBlur(context)
    return
  }
  if (event.name === 'cardDescription') {
    await saveCardDetail(context)
    return
  }
  if (event.name === 'cardLabelSearch') {
    if (context.state.cardLabelCreateOpen) {
      return
    }
    closeCardLabelPicker(context)
    return
  }
  await handleListTitleBlur(context, event)
}
