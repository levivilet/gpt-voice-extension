import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardDescriptionCancelButton } from '../RenderCardDescriptionCancelButton/RenderCardDescriptionCancelButton.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardDescriptionEditor = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { draftCardDescription, savingCardDetail } = state
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardDescriptionEditor',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceTextArea',
        'gpt-voiceCardDescriptionTextArea',
      ),
      name: 'cardDescription',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: gpt-voiceStrings.addDetailedDescription(),
      type: VirtualDomElements.TextArea,
      value: draftCardDescription,
    },
    {
      childCount: 2,
      className: 'gpt-voiceCardDetailActions',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardDetailSaveButton',
      ),
      name: 'saveCardDetail',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(savingCardDetail ? gpt-voiceStrings.saving() : gpt-voiceStrings.save()),
    ...renderCardDescriptionCancelButton(savingCardDetail),
  ]
}
