import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceAttachment } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { getAttachmentImageUrl } from '../AttachmentHelpers/AttachmentHelpers.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderImageAttachment = (
  attachment: Readonly<gpt-voiceAttachment>,
  attachmentImageUrls: Readonly<Record<string, string>>,
  failed: boolean,
): readonly VirtualDomNode[] => {
  const sourceUrl = getAttachmentImageUrl(attachment)
  const imageUrl = attachmentImageUrls[sourceUrl]
  if (failed || !imageUrl) {
    return [
      {
        childCount: 1,
        className: 'gpt-voiceCardDetailImageError',
        type: VirtualDomElements.Div,
      },
      text(gpt-voiceStrings.imageCouldNotBeLoaded()),
    ]
  }
  return [
    {
      alt: attachment.name || gpt-voiceStrings.cardAttachment(),
      childCount: 0,
      className: 'gpt-voiceCardDetailImage',
      name: attachment.id,
      onError: DomEventListenerFunctions.HandleImageError,
      src: imageUrl,
      type: VirtualDomElements.Img,
    },
  ]
}
