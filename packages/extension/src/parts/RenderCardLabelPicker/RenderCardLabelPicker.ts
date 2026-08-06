import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardLabelCreate } from '../RenderCardLabelCreate/RenderCardLabelCreate.ts'
import { renderCardLabelPickerContent } from '../RenderCardLabelPickerContent/RenderCardLabelPickerContent.ts'
import { renderCardLabelPickerHeader } from '../RenderCardLabelPickerHeader/RenderCardLabelPickerHeader.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardLabelPicker = (
  state: Readonly<gpt-voiceViewState>,
  labels: readonly gpt-voiceLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelCreateOpen, draftLabelSearchQuery } = state
  if (cardLabelCreateOpen) {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceCardLabelPicker',
        name: 'cardLabelPicker',
        onPointerDown:
          DomEventListenerFunctions.HandleCardLabelPickerPointerDown,
        type: VirtualDomElements.Div,
      },
      ...renderCardLabelCreate(state),
    ]
  }
  return [
    {
      childCount: 3,
      className: 'gpt-voiceCardLabelPicker',
      name: 'cardLabelPicker',
      onPointerDown: DomEventListenerFunctions.HandleCardLabelPickerPointerDown,
      type: VirtualDomElements.Div,
    },
    ...renderCardLabelPickerHeader(),
    {
      autocomplete: 'off',
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceInput',
        'gpt-voiceCardLabelSearchInput',
      ),
      name: 'cardLabelSearch',
      onBlur: DomEventListenerFunctions.HandleBlur,
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: gpt-voiceStrings.searchLabels(),
      type: VirtualDomElements.Input,
      value: draftLabelSearchQuery,
    },
    ...renderCardLabelPickerContent(state, labels),
  ]
}
