import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardCommentButton } from '../RenderCardCommentButton/RenderCardCommentButton.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardCommentComposer = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { draftComment, savingComment, writingComment } = state
  if (!writingComment) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'gpt-voiceButton',
          'gpt-voiceCardCommentWriteButton',
        ),
        name: 'startWriteComment',
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(gpt-voiceStrings.writeAComment()),
    ]
  }
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardCommentComposer',
      type: VirtualDomElements.Div,
    },
    {
      autofocus: true,
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceTextArea',
        'gpt-voiceCardCommentTextArea',
      ),
      disabled: savingComment,
      name: 'cardComment',
      onInput: DomEventListenerFunctions.HandleInput,
      onKeyDown: DomEventListenerFunctions.HandleKeyDown,
      placeholder: gpt-voiceStrings.writeACommentPlaceholder(),
      type: VirtualDomElements.TextArea,
      value: draftComment,
    },
    {
      childCount: 2,
      className: 'gpt-voiceCardCommentActions',
      type: VirtualDomElements.Div,
    },
    ...renderCardCommentButton(
      'submitComment',
      savingComment ? gpt-voiceStrings.saving() : gpt-voiceStrings.save(),
      MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardCommentSaveButton',
      ),
      savingComment,
    ),
    ...renderCardCommentButton(
      'cancelWriteComment',
      gpt-voiceStrings.cancel(),
      MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardCommentCancelButton',
      ),
      savingComment,
    ),
  ]
}
