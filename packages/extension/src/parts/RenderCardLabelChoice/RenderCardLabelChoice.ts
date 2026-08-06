import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { hasCardLabel } from '../HasCardLabel/HasCardLabel.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'

export const renderCardLabelChoice = (
  state: Readonly<gpt-voiceViewState>,
  labels: readonly gpt-voiceLabel[] | undefined,
  label: Readonly<gpt-voiceLabel>,
): readonly VirtualDomNode[] => {
  const { addingCardLabelId } = state
  const checked = hasCardLabel(labels, label.id)
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardLabelChoice',
      disabled: Boolean(addingCardLabelId),
      name: `addCardLabel:${label.id}`,
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    {
      checked,
      childCount: 0,
      className: 'gpt-voiceCardLabelChoiceCheckbox',
      inputType: 'checkbox',
      name: `cardLabelCheckbox:${label.id}`,
      tabIndex: -1,
      type: VirtualDomElements.Input,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceCardLabelChoiceText',
        getLabelColorClassName(label.color),
      ),
      type: VirtualDomElements.Span,
    },
    text(getLabelText(label)),
  ]
}
