import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'

export const renderCardDetailLabel = (
  label: Readonly<gpt-voiceLabel>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceCardLabel',
        'gpt-voiceCardLabelButton',
        getLabelColorClassName(label.color),
      ),
      name: 'openCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(getLabelText(label)),
  ]
}
