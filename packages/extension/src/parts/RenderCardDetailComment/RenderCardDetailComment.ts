import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceComment } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import {
  getCommentAuthor,
  getCommentAvatarUrl,
  getCommentDateText,
  getCommentText,
} from '../CommentHelpers/CommentHelpers.ts'
import { renderCardDetailAvatar } from '../RenderCardDetailAvatar/RenderCardDetailAvatar.ts'

const renderCommentDate = (dateText: string): readonly VirtualDomNode[] => {
  if (!dateText) {
    return []
  }
  return [
    {
      childCount: 1,
      className: 'gpt-voiceCardCommentDate',
      type: VirtualDomElements.Div,
    },
    text(dateText),
  ]
}

export const renderCardDetailComment = (
  comment: Readonly<gpt-voiceComment>,
): readonly VirtualDomNode[] => {
  const author = getCommentAuthor(comment)
  const avatarUrl = getCommentAvatarUrl(comment)
  const dateText = getCommentDateText(comment)
  const commentText = getCommentText(comment)
  const dateDom = renderCommentDate(dateText)
  return [
    {
      childCount: 2,
      className: 'gpt-voiceCardComment',
      type: VirtualDomElements.Div,
    },
    ...renderCardDetailAvatar(comment, author, avatarUrl),
    {
      childCount: 2,
      className: 'gpt-voiceCardCommentContent',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1 + (dateDom.length > 0 ? 1 : 0),
      className: 'gpt-voiceCardCommentHeader',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'gpt-voiceCardCommentAuthor',
      type: VirtualDomElements.Div,
    },
    text(author),
    ...dateDom,
    {
      childCount: 1,
      className: 'gpt-voiceCardCommentText',
      type: VirtualDomElements.Div,
    },
    text(commentText),
  ]
}
