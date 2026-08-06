import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCard,
  gpt-voiceCardMove,
  gpt-voiceCredentials,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedListCards } from '../GetBoardDetail/GetBoardDetail.ts'
import { deleteCachedCardDetail } from '../GetCardDetail/GetCardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const moveCard = async (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  move: gpt-voiceCardMove,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCard> => {
  const movedCard = await requestJson<gpt-voiceCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    {
      fields: 'name,url,idBoard,idList,badges,cover',
      idList: move.idList,
      pos: move.pos,
    },
    {
      method: 'PUT',
    },
  )
  await Promise.all([
    deleteCachedCardDetail(cache, card, credentials),
    ...(card.idList
      ? [deleteCachedListCards(cache, card.idList, credentials)]
      : []),
    deleteCachedListCards(cache, move.idList, credentials),
  ])
  return movedCard
}
