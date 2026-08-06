import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardDetailTitle } from '../RenderCardDetailTitle/RenderCardDetailTitle.ts'

export const renderCardDetailHeader = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardDetailHeader',
      type: VirtualDomElements.Div,
    },
    ...renderCardDetailTitle(state),
    {
      childCount: 1,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceButton',
        'gpt-voiceCardDetailCloseButton',
      ),
      name: 'closeCardDetail',
      onClick: DomEventListenerFunctions.HandleClick,
      type: VirtualDomElements.Button,
    },
    text('x'),
  ]
}
