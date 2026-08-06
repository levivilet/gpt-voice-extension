import type { ViewEvent } from '@lvce-editor/api'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { findBoardCard } from '../FindBoardCard/FindBoardCard.ts'
import { moveCardToList } from '../MoveCardToList/MoveCardToList.ts'
import { uploadCardAttachments } from '../UploadCardAttachments/UploadCardAttachments.ts'

const cardPrefix = 'card:'
const cardDetailName = 'cardDetail'
const listPrefix = 'list:'

const getEventString = (event: Readonly<ViewEvent>, key: string): string => {
  const value = (event as unknown as Readonly<Record<string, unknown>>)[key]
  return typeof value === 'string' ? value : ''
}

const getCardIdFromName = (name: string | undefined): string => {
  if (!name?.startsWith(cardPrefix)) {
    return ''
  }
  return name.slice(cardPrefix.length)
}

const getListIdFromName = (name: string | undefined): string => {
  if (!name?.startsWith(listPrefix)) {
    return ''
  }
  return name.slice(listPrefix.length)
}

const getDroppedCardId = (
  state: Readonly<gpt-voiceViewState>,
  event: Readonly<ViewEvent>,
): string => {
  const value = getEventString(event, 'value')
  if (value) {
    return value
  }
  const data = getEventString(event, 'data')
  if (data) {
    return data
  }
  const text = getEventString(event, 'text')
  if (text) {
    return text
  }
  return state.draggedCardId
}

const clearDragState = (state: Readonly<gpt-voiceViewState>): void => {
  const mutableState = state as gpt-voiceViewState
  mutableState.draggedCardId = ''
  mutableState.dragTargetListId = ''
}

export const handleDragStartEvent = (
  context: gpt-voiceViewActionContext,
  event: Readonly<ViewEvent>,
): void => {
  const state = context.state as gpt-voiceViewState
  const cardId = getCardIdFromName(event.name)
  state.draggedCardId = cardId
  state.dragTargetListId = ''
}

export const handleDragOverEvent = (
  context: gpt-voiceViewActionContext,
  event: Readonly<ViewEvent>,
): void => {
  const state = context.state as gpt-voiceViewState
  if (event.name === cardDetailName && !state.draggedCardId) {
    if (state.cardAttachmentDropActive) {
      return
    }
    state.cardAttachmentDropActive = true
    context.requestRerender()
    return
  }
  const listId = getListIdFromName(event.name)
  if (state.dragTargetListId === listId) {
    return
  }
  state.dragTargetListId = listId
  context.requestRerender()
}

export const handleDragLeaveEvent = (
  context: gpt-voiceViewActionContext,
): void => {
  const state = context.state as gpt-voiceViewState
  if (state.cardAttachmentDropActive) {
    state.cardAttachmentDropActive = false
    context.requestRerender()
    return
  }
  if (!state.dragTargetListId) {
    return
  }
  state.dragTargetListId = ''
  context.requestRerender()
}

export const handleDragEndEvent = (context: gpt-voiceViewActionContext): void => {
  clearDragState(context.state)
  context.requestRerender()
}

export const handleDropEvent = async (
  context: gpt-voiceViewActionContext,
  event: Readonly<ViewEvent>,
  fileList?: FileList,
): Promise<void> => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (event.name === cardDetailName && !state.draggedCardId) {
    await uploadCardAttachments(context, fileList)
    return
  }
  const targetListId = getListIdFromName(event.name)
  const cardId = getDroppedCardId(state, event)
  const card = findBoardCard(state, cardId)
  if (!state.credentials || !targetListId || !card) {
    clearDragState(state)
    requestRerender()
    return
  }
  clearDragState(state)
  await moveCardToList(context, card.id, targetListId, 'top')
}
