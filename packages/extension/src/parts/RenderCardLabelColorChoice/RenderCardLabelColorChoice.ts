import {
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { getLabelColorClassName } from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardLabelColorChoice = (
  state: Readonly<gpt-voiceViewState>,
  color: string,
): VirtualDomNode => {
  const { draftNewLabelColor, savingNewLabel } = state
  const selected = draftNewLabelColor === color
  const colorClassName = getLabelColorClassName(color)
  const colorLabel = gpt-voiceStrings.selectLabelColor(color.replace('_', ' '))
  return {
    'aria-label': colorLabel,
    'aria-pressed': selected,
    childCount: 0,
    className: selected
      ? MergeClassNames.mergeClassNames(
          'gpt-voiceCardLabelColorChoice',
          colorClassName,
          'gpt-voiceCardLabelColorChoiceSelected',
        )
      : MergeClassNames.mergeClassNames(
          'gpt-voiceCardLabelColorChoice',
          colorClassName,
        ),
    disabled: savingNewLabel,
    name: `selectCardLabelColor:${color}`,
    onClick: DomEventListenerFunctions.HandleClick,
    title: colorLabel,
    type: VirtualDomElements.Button,
  }
}
