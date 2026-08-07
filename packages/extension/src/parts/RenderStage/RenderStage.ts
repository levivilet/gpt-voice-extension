import {
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState } from '../CreateInstance/CreateInstance.ts'

const getBubbleClassName = (inProgress: boolean): string => {
  if (inProgress) {
    return 'GptVoiceBubble listening'
  }
  return 'GptVoiceBubble'
}
export const renderStage = (state: IState): readonly VirtualDomNode[] => {
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
