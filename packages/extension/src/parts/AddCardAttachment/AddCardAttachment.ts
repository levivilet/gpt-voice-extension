import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceAttachment,
  gpt-voiceCard,
  gpt-voiceCredentials,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedCardAttachments } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const addCardAttachment = async (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  file: File,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceAttachment> => {
  const formData = new FormData()
  formData.set('file', file, file.name)
  formData.set('name', file.name)
  if (file.type) {
    formData.set('mimeType', file.type)
  }
  const attachment = await requestJson<gpt-voiceAttachment>(
    fetchLike,
    `/cards/${card.id}/attachments`,
    credentials,
    {},
    {
      body: formData,
      method: 'POST',
    },
  )
  await deleteCachedCardAttachments(cache, card, credentials)
  return attachment
}
