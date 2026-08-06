import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceComment } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { getCommentInitials } from '../CommentHelpers/CommentHelpers.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardDetailAvatar = (
  comment: Readonly<gpt-voiceComment>,
  author: string,
  avatarUrl: string,
): readonly VirtualDomNode[] => {
  if (avatarUrl) {
    return [
      {
        alt: gpt-voiceStrings.avatar(author),
        childCount: 0,
        className: 'gpt-voiceCardCommentAvatar',
        src: avatarUrl,
        type: VirtualDomElements.Img,
      },
    ]
  }
  return [
    {
      childCount: 1,
      className: 'gpt-voiceCardCommentAvatar',
      type: VirtualDomElements.Div,
    },
    text(getCommentInitials(comment)),
  ]
}
