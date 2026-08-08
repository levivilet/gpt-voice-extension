import {
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import * as ClassNames from '../ClassNames/ClassNames.ts'

const audioNode: VirtualDomNode = {
  childCount: 0,
  className: ClassNames.GptVoiceAudio,
  type: VirtualDomElements.Audio,
}

export const renderAudio = (): readonly VirtualDomNode[] => {
  return [audioNode]
}
