import {
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState } from '../CreateInstance/CreateInstance.ts'

export const renderAudio = (state: IState): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ]
}
