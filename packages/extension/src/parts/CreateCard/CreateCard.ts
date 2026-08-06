import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCard,
  gpt-voiceCardCreate,
  gpt-voiceCredentials,
  gpt-voiceList,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedListCards } from '../GetBoardDetail/GetBoardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const createCard = async (
  fetchLike: FetchLike,
  list: gpt-voiceList,
  create: gpt-voiceCardCreate,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCard> => {
  const card = await requestJson<gpt-voiceCard>(
    fetchLike,
    '/cards',
    credentials,
    {
      fields: 'name,url,idBoard,idList,badges',
      idList: list.id,
      name: create.name,
      pos: create.pos,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedListCards(cache, list.id, credentials)
  return card
}
