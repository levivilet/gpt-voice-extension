import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceComment } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { renderCardDetailComment } from '../RenderCardDetailComment/RenderCardDetailComment.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardDetailComments = (
  loading: boolean,
  comments: readonly gpt-voiceComment[],
): readonly VirtualDomNode[] => {
  if (loading) {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceCardDetailEmpty',
        type: VirtualDomElements.Div,
      },
      text(gpt-voiceStrings.loadingComments()),
    ]
  }
  if (comments.length === 0) {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceCardDetailEmpty',
        type: VirtualDomElements.Div,
      },
      text(gpt-voiceStrings.noComments()),
    ]
  }
  return [
    {
      childCount: comments.length,
      className: 'gpt-voiceCardComments',
      type: VirtualDomElements.Div,
    },
    ...comments.flatMap(renderCardDetailComment),
  ]
}
