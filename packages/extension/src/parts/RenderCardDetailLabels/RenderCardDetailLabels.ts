import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardDetailLabel } from '../RenderCardDetailLabel/RenderCardDetailLabel.ts'
import { renderCardLabelPicker } from '../RenderCardLabelPicker/RenderCardLabelPicker.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const renderLabels = (
  labels: readonly gpt-voiceLabel[] | undefined,
): readonly VirtualDomNode[] => {
  if (!labels || labels.length === 0) {
    return [
      {
        childCount: 1,
        className: MergeClassNames.mergeClassNames(
          'gpt-voiceButton',
          'gpt-voiceCardLabelAddButton',
        ),
        name: 'openCardLabelPicker',
        onClick: DomEventListenerFunctions.HandleClick,
        type: VirtualDomElements.Button,
      },
      text(gpt-voiceStrings.labels()),
    ]
  }
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardLabelRow',
      type: VirtualDomElements.Div,
    },
    {
      childCount: labels.length,
      className: 'gpt-voiceCardLabels',
      type: VirtualDomElements.Div,
    },
    ...labels.flatMap(renderCardDetailLabel),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardLabelAddIconButton',
      ),
      name: 'openCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('+'),
  ]
}

const renderLabelPicker = (
  state: Readonly<gpt-voiceViewState>,
  labels: readonly gpt-voiceLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelPickerOpen } = state
  if (!cardLabelPickerOpen) {
    return []
  }
  return renderCardLabelPicker(state, labels)
}

export const renderCardDetailLabels = (
  state: Readonly<gpt-voiceViewState>,
  labels: readonly gpt-voiceLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { cardLabelPickerOpen } = state
  const labelDom = renderLabels(labels)
  const labelPickerDom = renderLabelPicker(state, labels)
  return [
    {
      childCount: 1 + (cardLabelPickerOpen ? 1 : 0),
      className: 'gpt-voiceCardLabelSection',
      type: VirtualDomElements.Div,
    },
    ...labelDom,
    ...labelPickerDom,
  ]
}
