import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardDescriptionHeader = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardDescriptionHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'gpt-voiceCardDetailSectionTitle',
      type: VirtualDomElements.H3,
    },
    text(gpt-voiceStrings.description()),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardDescriptionEditButton',
      ),
      name: 'editCardDescription',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text(gpt-voiceStrings.edit()),
  ]
}
