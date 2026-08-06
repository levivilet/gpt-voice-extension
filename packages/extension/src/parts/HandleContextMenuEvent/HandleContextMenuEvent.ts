import type { ViewEvent } from '@lvce-editor/api'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { findBoardCard } from '../FindBoardCard/FindBoardCard.ts'
import {
  MenuIdBoard,
  MenuIdCard,
  MenuIdCardDetail,
  MenuIdList,
} from '../MenuEntries/MenuEntries.ts'

const cardPrefix = 'card:'
const listPrefix = 'list:'
const cardDetailMenuNames: readonly string[] = [
  'cardDetail',
  'cardTitle',
  'cardDescription',
  'editCardDescription',
]

type ContextMenuEvent = Readonly<
  ViewEvent & {
    readonly x?: unknown
    readonly y?: unknown
  }
>

const setContextMenuTarget = (
  state: Readonly<gpt-voiceViewState>,
  listId: string,
  cardId = '',
): void => {
  const mutableState = state as gpt-voiceViewState
  mutableState.contextMenuListId = listId
  mutableState.contextMenuCardId = cardId
}

const getCardDetailMenuId = (state: Readonly<gpt-voiceViewState>): string => {
  const card = state.selectedCardDetail?.card
  if (!card) {
    return ''
  }
  setContextMenuTarget(state, card.idList || '', card.id)
  return MenuIdCardDetail
}

const getMenuId = (
  state: Readonly<gpt-voiceViewState>,
  name: string | undefined,
): string => {
  if (!name || name === 'boards') {
    setContextMenuTarget(state, '', '')
    return MenuIdBoard
  }
  if (name.startsWith(cardPrefix)) {
    const cardId = name.slice(cardPrefix.length)
    const card = findBoardCard(state, cardId)
    if (!card) {
      return ''
    }
    setContextMenuTarget(state, card.idList || '', card.id)
    return MenuIdCard
  }
  if (name.startsWith(listPrefix)) {
    setContextMenuTarget(state, name.slice(listPrefix.length), '')
    return MenuIdList
  }
  if (cardDetailMenuNames.includes(name)) {
    return getCardDetailMenuId(state)
  }
  return ''
}

export const handleContextMenuEvent = async (
  context: Readonly<gpt-voiceViewActionContext>,
  event: ContextMenuEvent,
): Promise<void> => {
  if (typeof event.x !== 'number' || typeof event.y !== 'number') {
    return
  }
  const { state } = context
  const menuId = getMenuId(state, event.name)
  if (!menuId) {
    return
  }
  await context.showContextMenu(menuId, event.x, event.y)
}
