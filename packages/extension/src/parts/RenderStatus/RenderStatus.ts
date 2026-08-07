import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { State } from '../State/State.ts'

export const renderStatus = (state: State): readonly VirtualDomNode[] => {
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
