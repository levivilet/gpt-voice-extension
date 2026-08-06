import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCard,
  gpt-voiceCredentials,
  gpt-voiceLabel,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedCardDetail } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const addCardLabel = async (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  label: gpt-voiceLabel,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCard> => {
  const updatedCard = await requestJson<gpt-voiceCard>(
    fetchLike,
    `/cards/${card.id}/idLabels`,
    credentials,
    {
      value: label.id,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedCardDetail(cache, card, credentials)
  return updatedCard
}
