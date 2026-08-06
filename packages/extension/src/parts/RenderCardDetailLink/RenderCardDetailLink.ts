import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardDetailLink = (
  url: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'gpt-voiceCardDetailLink',
      href: url,
      rel: 'noopener noreferrer',
      target: '_blank',
      type: VirtualDomElements.A,
    },
    text(gpt-voiceStrings.openIngpt-voice()),
  ]
}
