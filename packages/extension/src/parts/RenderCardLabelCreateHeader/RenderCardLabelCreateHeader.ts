import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardLabelCreateHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 3,
      className: 'gpt-voiceCardLabelPickerHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardLabelPickerBackButton',
      ),
      name: 'closeCardLabelCreate',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('<'),
    {
      childCount: 1,
      className: 'gpt-voiceCardLabelPickerTitle',
      type: VirtualDomElements.Div,
    },
    text(gpt-voiceStrings.createLabel()),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardLabelPickerCloseButton',
      ),
      name: 'closeCardLabelPicker',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('x'),
  ]
}
