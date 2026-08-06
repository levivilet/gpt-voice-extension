import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCard,
  gpt-voiceCardUpdate,
  gpt-voiceCredentials,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedCardDetail } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const updateCard = async (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  update: gpt-voiceCardUpdate,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCard> => {
  const updatedCard = await requestJson<gpt-voiceCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    {
      desc: update.desc,
      fields: 'name,desc,url,idBoard,idList,badges,cover',
      name: update.name,
    },
    {
      method: 'PUT',
    },
  )
  await deleteCachedCardDetail(cache, card, credentials)
  return updatedCard
}
