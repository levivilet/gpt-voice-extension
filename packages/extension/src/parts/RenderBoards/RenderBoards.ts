import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type {
  gpt-voiceBoard,
  gpt-voiceSearchResult,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import {
  getRecentlyViewedBoards,
  getWorkspaceSections,
  type WorkspaceSection,
} from '../BoardSections/BoardSections.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderError } from '../RenderError/RenderError.ts'
import { renderListTitle } from '../RenderListTitle/RenderListTitle.ts'
import { renderTitle } from '../RenderTitle/RenderTitle.ts'
import { renderToolbar } from '../RenderToolbar/RenderToolbar.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

interface VirtualDomSegment {
  readonly childCount: number
  readonly dom: readonly VirtualDomNode[]
}

const renderSearchForm = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { draftSearchQuery } = state
  return [
    {
      childCount: 1,
      className: 'gpt-voiceSearchForm',
      name: 'search',
      onSubmit: DomEventListenerFunctions.HandleSubmit,
      type: VirtualDomElements.Form,
    },
    {
      childCount: 0,
      className: 'gpt-voiceInput',
      name: 'search',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: gpt-voiceStrings.searchgpt-voice(),
      type: VirtualDomElements.Input,
      value: draftSearchQuery,
    },
  ]
}

const renderBoardButton = (
  board: Readonly<gpt-voiceBoard>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voiceBoardButton',
      name: `board:${board.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(board.name),
  ]
}

const renderBoardGrid = (
  boards: readonly gpt-voiceBoard[],
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: boards.length,
      className: 'gpt-voiceBoardGrid',
      type: VirtualDomElements.Div,
    },
    ...boards.flatMap(renderBoardButton),
  ]
}

const renderRecentlyViewed = (
  boards: readonly gpt-voiceBoard[],
): VirtualDomSegment => {
  if (boards.length === 0) {
    return { childCount: 0, dom: [] }
  }
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'gpt-voiceSection',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(gpt-voiceStrings.recentlyViewed()),
      ...renderBoardGrid(boards),
    ],
  }
}

const renderWorkspaceSection = (
  section: Readonly<WorkspaceSection>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'gpt-voiceWorkspace',
      type: VirtualDomElements.Div,
    },
    ...renderListTitle(section.name),
    ...renderBoardGrid(section.boards),
  ]
}

const renderSearchResult = (
  result: Readonly<gpt-voiceSearchResult>,
): readonly VirtualDomNode[] => {
  if (result.type === 'board') {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceSearchResult',
        name: `board:${result.id}`,
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(gpt-voiceStrings.boardSearchResult(result.name)),
    ]
  }
  return [
    {
      childCount: 1,
      className: 'gpt-voiceSearchResult',
      type: VirtualDomElements.Div,
    },
    text(gpt-voiceStrings.cardSearchResult(result.name)),
  ]
}

const renderSearchContent = (
  state: Readonly<gpt-voiceViewState>,
): VirtualDomSegment => {
  const { activeSearchQuery, loading, searchResults } = state
  if (loading) {
    return { childCount: 1, dom: [text(gpt-voiceStrings.searching())] }
  }
  if (searchResults.length === 0) {
    return {
      childCount: 2,
      dom: [
        ...renderListTitle(gpt-voiceStrings.searchResultsFor(activeSearchQuery)),
        text(gpt-voiceStrings.noSearchResults()),
      ],
    }
  }
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'gpt-voiceSearchSection',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(gpt-voiceStrings.searchResultsFor(activeSearchQuery)),
      {
        childCount: searchResults.length,
        className: 'gpt-voiceSearchResults',
        type: VirtualDomElements.Div,
      },
      ...searchResults.flatMap(renderSearchResult),
    ],
  }
}

const renderBoardContent = (
  state: Readonly<gpt-voiceViewState>,
): VirtualDomSegment => {
  const { activeSearchQuery, boards, loading } = state
  if (activeSearchQuery) {
    return renderSearchContent(state)
  }
  if (loading) {
    return { childCount: 1, dom: [text(gpt-voiceStrings.loadingBoards())] }
  }
  if (boards.length === 0) {
    return { childCount: 1, dom: [text(gpt-voiceStrings.noBoardsFound())] }
  }
  const recentBoards = getRecentlyViewedBoards(state)
  const workspaceSections = getWorkspaceSections(state)
  const recentlyViewed = renderRecentlyViewed(recentBoards)
  return {
    childCount: recentlyViewed.childCount + 1,
    dom: [
      ...recentlyViewed.dom,
      {
        childCount: 1 + workspaceSections.length,
        className: 'gpt-voiceWorkspaces',
        type: VirtualDomElements.Div,
      },
      ...renderListTitle(gpt-voiceStrings.yourWorkspaces()),
      ...workspaceSections.flatMap(renderWorkspaceSection),
    ],
  }
}

const renderSearchToolbar = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { searchEnabled } = state
  if (!searchEnabled) {
    return []
  }
  return renderToolbar([renderSearchForm(state)])
}

export const renderBoards = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { error } = state
  const boardContent = renderBoardContent(state)
  const errorDom = renderError(error)
  const searchToolbar = renderSearchToolbar(state)
  return [
    {
      childCount:
        1 +
        boardContent.childCount +
        (searchToolbar.length > 0 ? 1 : 0) +
        (errorDom.length > 0 ? 1 : 0),
      className: MergeClassNames.mergeClassNames('gpt-voiceView', 'gpt-voiceBoards'),
      name: 'boards',
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      type: VirtualDomElements.Div,
    },
    ...searchToolbar,
    ...renderTitle(gpt-voiceStrings.boards()),
    ...boardContent.dom,
    ...errorDom,
  ]
}
