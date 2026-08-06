import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceCredentials,
  gpt-voiceList,
  gpt-voiceListCreate,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedBoardLists } from '../GetBoardDetail/GetBoardDetail.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const createList = async (
  fetchLike: FetchLike,
  board: gpt-voiceBoard,
  create: gpt-voiceListCreate,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceList> => {
  const list = await requestJson<Omit<gpt-voiceList, 'cards'>>(
    fetchLike,
    '/lists',
    credentials,
    {
      fields: 'name',
      idBoard: board.id,
      name: create.name,
      pos: create.pos,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedBoardLists(cache, board.id, credentials)
  return {
    ...list,
    cards: [],
  }
}
