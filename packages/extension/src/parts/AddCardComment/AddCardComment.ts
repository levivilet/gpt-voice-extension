import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCard,
  gpt-voiceComment,
  gpt-voiceCredentials,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedCardComments } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const addCardComment = async (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  text: string,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceComment> => {
  const comment = await requestJson<gpt-voiceComment>(
    fetchLike,
    `/cards/${card.id}/actions/comments`,
    credentials,
    {
      text,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedCardComments(cache, card, credentials)
  return comment
}
