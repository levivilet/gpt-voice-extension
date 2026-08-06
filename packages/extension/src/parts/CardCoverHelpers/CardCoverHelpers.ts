import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import {
  getAttachmentImageUrl,
  isImageAttachment,
} from '../AttachmentHelpers/AttachmentHelpers.ts'

const getCardAttachmentImageUrl = (card: Readonly<gpt-voiceCard>): string => {
  const attachment = card.attachments?.find(isImageAttachment)
  if (!attachment) {
    return ''
  }
  return getAttachmentImageUrl(attachment)
}

export const getCardCoverImageUrl = (card: Readonly<gpt-voiceCard>): string => {
  const { cover } = card
  if (!cover) {
    return getCardAttachmentImageUrl(card)
  }
  const scaledUrl = cover.scaled?.at(-1)?.url
  if (scaledUrl) {
    return scaledUrl
  }
  if (cover.url) {
    return cover.url
  }
  return cover.sharedSourceUrl || getCardAttachmentImageUrl(card)
}
