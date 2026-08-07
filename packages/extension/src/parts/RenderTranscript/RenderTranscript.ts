import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { State } from '../State/State.ts'

export const renderTranscript = (state: State): readonly VirtualDomNode[] => {
  const { transcribedText } = state
  return [
    {
      childCount: 1,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
    text(transcribedText),
  ]
}
