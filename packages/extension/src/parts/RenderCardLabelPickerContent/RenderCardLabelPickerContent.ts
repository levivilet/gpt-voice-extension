import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { getMatchingLabels } from '../GetMatchingLabels/GetMatchingLabels.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardLabelChoice } from '../RenderCardLabelChoice/RenderCardLabelChoice.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardLabelPickerContent = (
  state: Readonly<gpt-voiceViewState>,
  labels: readonly gpt-voiceLabel[] | undefined,
): readonly VirtualDomNode[] => {
  const { boardLabelsLoading, draftLabelSearchQuery } = state
  if (boardLabelsLoading) {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceCardLabelPickerEmpty',
        type: VirtualDomElements.Div,
      },
      text(gpt-voiceStrings.loadingLabels()),
    ]
  }
  const matchingLabels = getMatchingLabels(state)
  if (matchingLabels.length === 0) {
    if (draftLabelSearchQuery.trim()) {
      return [
        {
          childCount: 1,
          className: MergeClassNames.mergeClassNames(
            'gpt-voiceButton',
            'gpt-voiceCardLabelCreateButton',
          ),
          name: 'openCardLabelCreate',
          onClick: DomEventListenerFunctions.HandleClick,
          type: VirtualDomElements.Button,
        },
        text(gpt-voiceStrings.createNewLabel()),
      ]
    }
    return [
      {
        childCount: 1,
        className: 'gpt-voiceCardLabelPickerEmpty',
        type: VirtualDomElements.Div,
      },
      text(gpt-voiceStrings.noLabelsAvailable()),
    ]
  }
  return [
    {
      childCount: matchingLabels.length,
      className: 'gpt-voiceCardLabelPickerList',
      type: VirtualDomElements.Div,
    },
    ...matchingLabels.flatMap((label) =>
      renderCardLabelChoice(state, labels, label),
    ),
  ]
}
