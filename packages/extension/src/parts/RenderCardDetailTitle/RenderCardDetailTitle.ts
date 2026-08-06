import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'

export const renderCardDetailTitle = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { draftCardTitle, editingCardTitle } = state
  const className = editingCardTitle
    ? MergeClassNames.mergeClassNames(
        'gpt-voiceCardDetailTitleInput',
        'gpt-voiceCardDetailTitleInputEditing',
      )
    : 'gpt-voiceCardDetailTitleInput'
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardDetailTitleSizer',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className,
      name: 'cardTitle',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onClick: DomEventListenerFunctions.HandleClick,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      rows: 1,
      type: VirtualDomElements.TextArea,
      value: draftCardTitle,
    },
    {
      ariaHidden: true,
      childCount: 1,
      className: 'gpt-voiceCardDetailTitleMirror',
      type: VirtualDomElements.Div,
    },
    text(draftCardTitle || ' '),
  ]
}
