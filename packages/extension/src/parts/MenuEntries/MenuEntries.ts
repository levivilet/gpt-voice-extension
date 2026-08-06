import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const MenuIdBoard = 'gpt-voice.board'
export const MenuIdCard = 'gpt-voice.card'
export const MenuIdCardDetail = 'gpt-voice.cardDetail'
export const MenuIdList = 'gpt-voice.list'

export interface MenuEntry {
  readonly args?: readonly string[]
  readonly command: string
  readonly id: string
  readonly label: string
}

const menuEntryRefreshBoards: MenuEntry = {
  command: 'gpt-voice.refreshBoards',
  id: 'refreshBoards',
  label: gpt-voiceStrings.refreshBoards(),
}

const menuEntrySignOut: MenuEntry = {
  command: 'gpt-voice.logout',
  id: 'signOut',
  label: gpt-voiceStrings.signOut(),
}

const menuEntryBackToBoards: MenuEntry = {
  command: 'gpt-voice.backToBoards',
  id: 'backToBoards',
  label: gpt-voiceStrings.backToBoards(),
}

const menuEntrySaveCard: MenuEntry = {
  command: 'gpt-voice.saveCardDetail',
  id: 'saveCard',
  label: gpt-voiceStrings.saveCard(),
}

const menuEntryCloseCard: MenuEntry = {
  command: 'gpt-voice.closeCardDetail',
  id: 'closeCard',
  label: gpt-voiceStrings.closeCard(),
}

const getAddCardEntry = (
  state: Readonly<gpt-voiceViewState>,
): readonly MenuEntry[] => {
  if (!state.contextMenuListId) {
    return []
  }
  return [
    {
      args: [state.contextMenuListId],
      command: 'gpt-voice.startAddCard',
      id: 'addCard',
      label: gpt-voiceStrings.addCardMenu(),
    },
  ]
}

const getOpenCardEntry = (
  state: Readonly<gpt-voiceViewState>,
): readonly MenuEntry[] => {
  if (!state.contextMenuCardId) {
    return []
  }
  return [
    {
      args: [state.contextMenuCardId],
      command: 'gpt-voice.openCard',
      id: 'openCard',
      label: gpt-voiceStrings.openCard(),
    },
  ]
}

export const getMenuEntries = (
  state: Readonly<gpt-voiceViewState>,
  menuId: string,
): readonly MenuEntry[] => {
  switch (menuId) {
    case MenuIdBoard:
      return [menuEntryRefreshBoards, menuEntrySignOut]
    case MenuIdCard:
      return [
        ...getOpenCardEntry(state),
        ...getAddCardEntry(state),
        menuEntryRefreshBoards,
        menuEntryBackToBoards,
      ]
    case MenuIdCardDetail:
      return [
        menuEntrySaveCard,
        menuEntryCloseCard,
        menuEntryRefreshBoards,
        menuEntryBackToBoards,
      ]
    case MenuIdList:
      return [
        ...getAddCardEntry(state),
        menuEntryRefreshBoards,
        menuEntryBackToBoards,
      ]
    default:
      return []
  }
}
