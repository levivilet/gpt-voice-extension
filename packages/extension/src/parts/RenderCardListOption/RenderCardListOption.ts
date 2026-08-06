import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceList } from '../gpt-voiceTypes/gpt-voiceTypes.ts'

export const renderCardListOption = (
  list: Readonly<gpt-voiceList>,
  selectedListId: string,
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      selected: list.id === selectedListId,
      type: VirtualDomElements.Option,
      value: list.id,
    },
    text(list.name),
  ]
}
