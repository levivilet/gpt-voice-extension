import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState } from '../CreateInstance/CreateInstance.ts'

export const renderStatus = (state: IState): readonly VirtualDomNode[] => {
  if (state.inProgress) {
    return [
      {
        childCount: 1,
        className: 'GptVoiceStatus',
        type: VirtualDomElements.Div,
      },
      text('In Progress'),
    ]
  }
  return [
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('idle'),
  ]
}
