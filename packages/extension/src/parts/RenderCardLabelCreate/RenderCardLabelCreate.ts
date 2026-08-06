import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import {
  getLabelColorClassName,
  labelColors,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardLabelColorChoice } from '../RenderCardLabelColorChoice/RenderCardLabelColorChoice.ts'
import { renderCardLabelCreateHeader } from '../RenderCardLabelCreateHeader/RenderCardLabelCreateHeader.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardLabelCreate = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { draftNewLabelColor, draftNewLabelName, savingNewLabel } = state
  return [
    {
      childCount: 3,
      className: 'gpt-voiceCardLabelCreate',
      type: VirtualDomElements.Div,
    },
    ...renderCardLabelCreateHeader(),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceCardLabelCreatePreview',
        getLabelColorClassName(draftNewLabelColor),
      ),
      type: VirtualDomElements.Div,
    },
    text(draftNewLabelName || gpt-voiceStrings.labelTitle()),
    {
      childCount: 5,
      className: 'gpt-voiceCardLabelCreateFields',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text(gpt-voiceStrings.title()),
    {
      autocomplete: 'off',
      childCount: 0,
      className: 'gpt-voiceInput',
      disabled: savingNewLabel,
      name: 'newLabelName',
      onFocus: DomEventListenerFunctions.HandleFocus,
      onInput: DomEventListenerFunctions.HandleInput,
      placeholder: gpt-voiceStrings.labelTitle(),
      type: VirtualDomElements.Input,
      value: draftNewLabelName,
    },
    {
      childCount: 1,
      type: VirtualDomElements.Label,
    },
    text(gpt-voiceStrings.selectAColor()),
    {
      childCount: labelColors.length,
      className: 'gpt-voiceCardLabelColorGrid',
      type: VirtualDomElements.Div,
    },
    ...labelColors.map((color) => renderCardLabelColorChoice(state, color)),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voicePrimaryButton',
      ),
      disabled: savingNewLabel || !draftNewLabelName.trim(),
      name: 'createCardLabel',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(savingNewLabel ? gpt-voiceStrings.creating() : gpt-voiceStrings.create()),
  ]
}
