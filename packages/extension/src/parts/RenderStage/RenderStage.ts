import {
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { State } from '../State/State.ts'

const getBubbleClassName = (inProgress: boolean): string => {
  if (inProgress) {
    return 'GptVoiceBubble listening'
  }
  return 'GptVoiceBubble'
}
export const renderStage = (state: State): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'GptVoiceStage',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: getBubbleClassName(state.inProgress),
      type: VirtualDomElements.Div,
    },
  ]
}
