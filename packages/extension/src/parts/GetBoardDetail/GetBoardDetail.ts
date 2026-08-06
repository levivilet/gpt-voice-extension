import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceBoardDetail,
  gpt-voiceCredentials,
  gpt-voiceList,
  gpt-voiceCard,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import {
  deleteCachedJson,
  readCachedJson,
  requestJson,
  requestJsonBatch,
  type gpt-voiceBatchRequest,
} from '../RequestJson/RequestJson.ts'

const batchRequestLimit = 10

const listParams = {
  fields: 'name',
} as const

const cardsParams = {
  attachment_fields: 'name,url,mimeType,previews',
  attachments: 'cover',
  fields: 'name,desc,url,idBoard,idList,badges,cover,labels',
} as const

export const deleteCachedBoardLists = async (
  cache: gpt-voiceApiCache | undefined,
  boardId: string,
  credentials: gpt-voiceCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/boards/${boardId}/lists`,
    credentials,
    listParams,
  )
}

export const deleteCachedListCards = async (
  cache: gpt-voiceApiCache | undefined,
  listId: string,
  credentials: gpt-voiceCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/lists/${listId}/cards`,
    credentials,
    cardsParams,
  )
}

export const readCachedBoardDetail = async (
  cache: gpt-voiceApiCache | undefined,
  board: gpt-voiceBoard,
  credentials: gpt-voiceCredentials,
): Promise<gpt-voiceBoardDetail | undefined> => {
  const lists = await readCachedJson<readonly Omit<gpt-voiceList, 'cards'>[]>(
    cache,
    `/boards/${board.id}/lists`,
    credentials,
    listParams,
  )
  if (!lists) {
    return undefined
  }
  const cardsByList = await Promise.all(
    lists.map((list) => {
      return readCachedJson<readonly gpt-voiceCard[]>(
        cache,
        `/lists/${list.id}/cards`,
        credentials,
        cardsParams,
      )
    }),
  )
  if (cardsByList.some((cards) => !cards)) {
    return undefined
  }
  return {
    board,
    lists: lists.map((list, index) => {
      return {
        cards: cardsByList[index] || [],
        id: list.id,
        name: list.name,
      }
    }),
  }
}

export const getBoardDetail = async (
  fetchLike: FetchLike,
  board: gpt-voiceBoard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
  batchRequestsEnabled = false,
): Promise<gpt-voiceBoardDetail> => {
  const lists = await requestJson<readonly Omit<gpt-voiceList, 'cards'>[]>(
    fetchLike,
    `/boards/${board.id}/lists`,
    credentials,
    listParams,
    undefined,
    cache,
  )
  const cardsByList = batchRequestsEnabled
    ? await getCardsBatched(fetchLike, lists, credentials, cache)
    : await Promise.all(
        lists.map((list) => {
          return requestJson<readonly gpt-voiceCard[]>(
            fetchLike,
            `/lists/${list.id}/cards`,
            credentials,
            cardsParams,
            undefined,
            cache,
          )
        }),
      )
  return {
    board,
    lists: lists.map((list, index) => {
      return {
        cards: cardsByList[index] || [],
        id: list.id,
        name: list.name,
      }
    }),
  }
}

const getCardsBatched = async (
  fetchLike: FetchLike,
  lists: readonly Omit<gpt-voiceList, 'cards'>[],
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<readonly (readonly gpt-voiceCard[])[]> => {
  const requests: gpt-voiceBatchRequest[] = lists.map((list) => {
    return {
      params: cardsParams,
      path: `/lists/${list.id}/cards`,
    }
  })
  const batches: gpt-voiceBatchRequest[][] = []
  for (let index = 0; index < requests.length; index += batchRequestLimit) {
    batches.push(requests.slice(index, index + batchRequestLimit))
  }
  const results = await Promise.all(
    batches.map((batch: readonly gpt-voiceBatchRequest[]) => {
      return requestJsonBatch<readonly (readonly gpt-voiceCard[])[]>(
        fetchLike,
        batch,
        credentials,
        cache,
      )
    }),
  )
  return results.flat()
}
