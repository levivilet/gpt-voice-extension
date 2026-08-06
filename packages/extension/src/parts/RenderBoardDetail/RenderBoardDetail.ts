import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  gpt-voiceBoardDetail,
  gpt-voiceList,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getBoardBackgroundClassName } from '../BoardBackground/BoardBackground.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { filterListCards } from '../FilterBoardCards/FilterBoardCards.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderBoardFilter } from '../RenderBoardFilter/RenderBoardFilter.ts'
import { renderCardDetailPanel } from '../RenderCardDetailPanel/RenderCardDetailPanel.ts'
import { renderCards } from '../RenderCards/RenderCards.ts'
import { renderError } from '../RenderError/RenderError.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const renderListTitleInput = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  const { draftListTitles } = state
  return [
    {
      childCount: 1,
      className: 'gpt-voiceListTitleInputWrapper',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'gpt-voiceListTitleInput',
      name: `listTitle:${list.id}`,
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      type: VirtualDomElements.Input,
      value: draftListTitles[list.id] ?? list.name,
    },
  ]
}

const renderListHeader = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'gpt-voiceListHeader',
      type: VirtualDomElements.Div,
    },
    ...renderListTitleInput(state, list),
    {
      childCount: 1,
      className: 'gpt-voiceListCardCount',
      type: VirtualDomElements.Div,
    },
    text(String(list.cards.length)),
  ]
}

const renderAddCardButton = (
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voiceAddCardButton',
      name: `addCard:${list.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(gpt-voiceStrings.addACard()),
  ]
}

const renderAddCardActions = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  const { savingNewCard } = state
  return [
    {
      childCount: 2,
      className: 'gpt-voiceAddCardActions',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceAddCardSubmitButton',
      ),
      disabled: savingNewCard,
      inputType: 'button',
      name: `submitAddCard:${list.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      onPointerDown: DomEventListenerFunctions.HandleAddCardActionPointerDown,
      type: VirtualDomElements.Button,
    },
    text(gpt-voiceStrings.addCard()),
    {
      'aria-label': gpt-voiceStrings.close(),
      childCount: 1,
      className: 'gpt-voiceAddCardCloseButton',
      inputType: 'button',
      name: 'cancelAddCard',
      onClick: DomEventListenerFunctions.HandleClick,
      onPointerDown: DomEventListenerFunctions.HandleAddCardActionPointerDown,
      title: gpt-voiceStrings.close(),
      type: VirtualDomElements.Button,
    },
    text('X'),
  ]
}

const renderAddCardInput = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  const { draftNewCardTitle, savingNewCard } = state
  return [
    {
      childCount: 2,
      className: 'gpt-voiceAddCardForm',
      name: `addCard:${list.id}`,
      onSubmit: DomEventListenerFunctions.HandleSubmit,
      type: VirtualDomElements.Form,
    },
    {
      autocomplete: 'off',
      childCount: 0,
      className: 'gpt-voiceAddCardInput',
      disabled: savingNewCard,
      name: `newCardTitle:${list.id}`,
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: gpt-voiceStrings.enterCardTitle(),
      rows: 2,
      type: VirtualDomElements.TextArea,
      value: draftNewCardTitle,
    },
    ...renderAddCardActions(state, list),
  ]
}

const renderAddCardControl = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  const { addingCardListId } = state
  if (addingCardListId === list.id) {
    return renderAddCardInput(state, list)
  }
  return renderAddCardButton(list)
}

const renderAddListControl = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { addingList, draftNewListTitle, savingNewList } = state
  if (addingList) {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceAddListForm',
        name: 'addList',
        onSubmit: DomEventListenerFunctions.HandleSubmit,
        type: VirtualDomElements.Form,
      },
      {
        autocomplete: 'off',
        childCount: 0,
        className: 'gpt-voiceAddListInput',
        disabled: savingNewList,
        name: 'newListTitle',
        onBlur: DomEventListenerFunctions.HandleBlur,
        onFocus: DomEventListenerFunctions.HandleFocus,
        onInput: DomEventListenerFunctions.HandleInput,
        onKeyDown: DomEventListenerFunctions.HandleKeyDown,
        placeholder: gpt-voiceStrings.enterListTitle(),
        type: VirtualDomElements.Input,
        value: draftNewListTitle,
      },
    ]
  }
  return [
    {
      childCount: 1,
      className: 'gpt-voiceAddListButton',
      name: 'startAddList',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(gpt-voiceStrings.createNewList()),
  ]
}

const getListClassName = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): string => {
  const { dragTargetListId } = state
  if (dragTargetListId === list.id) {
    return MergeClassNames.mergeClassNames('gpt-voiceList', 'gpt-voiceListDragTarget')
  }
  return 'gpt-voiceList'
}

const renderList = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): readonly VirtualDomNode[] => {
  const { baseUrl, coverImageUrls, draftBoardFilter } = state
  const filteredList = filterListCards(list, draftBoardFilter)
  const cards = renderCards(baseUrl, coverImageUrls, filteredList.cards)
  return [
    {
      childCount: 3,
      className: getListClassName(state, list),
      'data-id': `list:${list.id}`,
      name: `list:${list.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onDragLeave: DomEventListenerFunctions.HandleDragLeave,
      onDragOver: DomEventListenerFunctions.HandleDragOver,
      onDrop: DomEventListenerFunctions.HandleDrop,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    ...renderListHeader(state, filteredList),
    {
      childCount: Math.max(1, filteredList.cards.length),
      className: 'gpt-voiceCards',
      type: VirtualDomElements.Div,
    },
    ...cards,
    ...renderAddCardControl(state, list),
  ]
}

const getCardDetailPanelChildCount = (
  state: Readonly<gpt-voiceViewState>,
): number => {
  const { cardDetailLoading, cardDetailPopupEnabled, selectedCardDetail } =
    state
  if (selectedCardDetail) {
    return cardDetailPopupEnabled ? 1 : 2
  }
  if (cardDetailLoading) {
    return 1
  }
  return 0
}

const renderBoardDetailContent = (
  state: Readonly<gpt-voiceViewState>,
  detail: Readonly<gpt-voiceBoardDetail>,
): readonly VirtualDomNode[] => {
  const { loading } = state
  if (loading) {
    return [text(gpt-voiceStrings.loadingBoard())]
  }
  const cardDetailPanel = renderCardDetailPanel(state)
  const cardDetailPanelChildCount = getCardDetailPanelChildCount(state)
  return [
    {
      childCount: 1 + cardDetailPanelChildCount,
      className: 'gpt-voiceBoardDetailContent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: detail.lists.length + 1,
      className: 'gpt-voiceLists',
      type: VirtualDomElements.Div,
    },
    ...detail.lists.flatMap((list) => renderList(state, list)),
    ...renderAddListControl(state),
    ...cardDetailPanel,
  ]
}

export const renderBoardDetail = (
  state: Readonly<gpt-voiceViewState>,
  detail: Readonly<gpt-voiceBoardDetail>,
): readonly VirtualDomNode[] => {
  const { boardBackgroundEnabled, boardFilterOpen, error } = state
  const content = renderBoardDetailContent(state, detail)
  const filter = renderBoardFilter(state)
  const errorDom = renderError(error)
  return [
    {
      childCount: 1 + (boardFilterOpen ? 2 : 0) + (errorDom.length > 0 ? 1 : 0),
      className: getBoardBackgroundClassName(
        detail.board,
        boardBackgroundEnabled,
      ),
      type: VirtualDomElements.Div,
    },
    ...filter,
    ...content,
    ...errorDom,
  ]
}
