import {
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { State } from '../State/State.ts'

export const renderAudio = (state: State): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ]
}
