import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState } from '../CreateInstance/CreateInstance.ts'

export const renderButton = (state: IState): readonly VirtualDomNode[] => {
  if (state.inProgress) {
    return [
      {
        childCount: 1,
        className: 'GptVoiceButton',
        id: 'toggle',
        onClick: 'handleClickStart',
        type: VirtualDomElements.Button,
      },
      text('Stop talking'),
    ]
  }
  return [
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: 'handleClickStart',
      type: VirtualDomElements.Button,
    },
    text('Start talking'),
  ]
}
