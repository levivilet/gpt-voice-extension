import {
  AriaRoles,
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const renderBoardFilterPopup = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen, draftBoardFilter } = state
  if (!boardFilterOpen) {
    return []
  }
  return [
    {
      'aria-label': gpt-voiceStrings.filterCards(),
      childCount: 3,
      className: 'gpt-voiceBoardFilterPopup',
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 2,
      className: 'gpt-voiceBoardFilterPopupHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'gpt-voiceBoardFilterPopupTitle',
      type: VirtualDomElements.Div,
    },
    text(gpt-voiceStrings.filter()),
    {
      'aria-label': gpt-voiceStrings.close(),
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceBoardFilterCloseButton',
      ),
      name: 'closeBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      title: gpt-voiceStrings.close(),
      type: VirtualDomElements.Button,
    },
    text('x'),
    {
      childCount: 2,
      className: 'gpt-voiceBoardFilterField',
      type: VirtualDomElements.Label,
    },
    {
      childCount: 1,
      className: 'gpt-voiceBoardFilterLabel',
      type: VirtualDomElements.Span,
    },
    text(gpt-voiceStrings.keyword()),
    {
      autocomplete: 'off',
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceInput',
        'gpt-voiceBoardFilterInput',
      ),
      name: 'boardFilter',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: gpt-voiceStrings.filterCards(),
      type: VirtualDomElements.Input,
      value: draftBoardFilter,
    },
    {
      childCount: 1,
      className: 'gpt-voiceBoardFilterHint',
      type: VirtualDomElements.Div,
    },
    text(gpt-voiceStrings.filterCardsHint()),
  ]
}

const renderBoardFilterOverlay = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen } = state
  if (!boardFilterOpen) {
    return []
  }
  return [
    {
      childCount: 0,
      className: 'gpt-voiceBoardFilterOverlay',
      name: 'closeBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ]
}

export const renderBoardFilter = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const overlay = renderBoardFilterOverlay(state)
  const popup = renderBoardFilterPopup(state)
  return [...overlay, ...popup]
}
