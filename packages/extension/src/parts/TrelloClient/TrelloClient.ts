import type {
  FetchLike,
  gpt-voiceCacheFirstResult,
  gpt-voiceClient,
  gpt-voiceClientOptions,
} from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceBoardDetail,
  gpt-voiceCard,
  gpt-voiceCardDetail,
  gpt-voiceComment,
  gpt-voiceCredentials,
  gpt-voiceLabel,
  gpt-voiceSearchResult,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { addCardAttachment } from '../AddCardAttachment/AddCardAttachment.ts'
import { addCardComment } from '../AddCardComment/AddCardComment.ts'
import { addCardLabel } from '../AddCardLabel/AddCardLabel.ts'
import { createCard } from '../CreateCard/CreateCard.ts'
import { createLabel } from '../CreateLabel/CreateLabel.ts'
import { createList } from '../CreateList/CreateList.ts'
import {
  getBoardDetail,
  readCachedBoardDetail,
} from '../GetBoardDetail/GetBoardDetail.ts'
import {
  getCardDetail,
  getCardDetailParts,
  readCachedCardDetail,
} from '../GetCardDetail/GetCardDetail.ts'
import { listBoardLabels } from '../ListBoardLabels/ListBoardLabels.ts'
import { listBoards, readCachedListBoards } from '../ListBoards/ListBoards.ts'
import { moveCard } from '../MoveCard/MoveCard.ts'
import { readCachedSearch, search } from '../Search/Search.ts'
import {
  createCacheStoragegpt-voiceApiCache,
  type gpt-voiceApiCache,
} from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import { updateCard } from '../UpdateCard/UpdateCard.ts'
import { updateList } from '../UpdateList/UpdateList.ts'

export type {
  FetchLike,
  gpt-voiceClient,
} from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'

export const creategpt-voiceClient = (
  fetchLike: FetchLike = fetch,
  cache: gpt-voiceApiCache | undefined = createCacheStoragegpt-voiceApiCache(),
  options: gpt-voiceClientOptions = {},
): gpt-voiceClient => {
  const readBatchRequestsEnabled =
    options.readBatchRequestsEnabled ||
    ((): Promise<boolean> => Promise.resolve(false))
  const getFreshBoardDetail = async (
    board: gpt-voiceBoard,
    credentials: gpt-voiceCredentials,
  ): Promise<gpt-voiceBoardDetail> => {
    return getBoardDetail(
      fetchLike,
      board,
      credentials,
      cache,
      await readBatchRequestsEnabled(),
    )
  }
  const getFreshCardDetail = async (
    card: gpt-voiceCard,
    credentials: gpt-voiceCredentials,
  ): Promise<gpt-voiceCardDetail> => {
    return getCardDetail(
      fetchLike,
      card,
      credentials,
      cache,
      await readBatchRequestsEnabled(),
    )
  }
  return {
    addCardAttachment(
      card,
      file,
      credentials,
    ): ReturnType<gpt-voiceClient['addCardAttachment']> {
      return addCardAttachment(fetchLike, card, file, credentials, cache)
    },
    addCardComment(
      card: gpt-voiceCard,
      text: string,
      credentials: gpt-voiceCredentials,
    ): Promise<gpt-voiceComment> {
      return addCardComment(fetchLike, card, text, credentials, cache)
    },
    addCardLabel(
      card: gpt-voiceCard,
      label: gpt-voiceLabel,
      credentials: gpt-voiceCredentials,
    ): ReturnType<gpt-voiceClient['addCardLabel']> {
      return addCardLabel(fetchLike, card, label, credentials, cache)
    },
    createCard(
      list,
      create,
      credentials,
    ): ReturnType<gpt-voiceClient['createCard']> {
      return createCard(fetchLike, list, create, credentials, cache)
    },
    createLabel(
      board: gpt-voiceBoard,
      create,
      credentials,
    ): ReturnType<gpt-voiceClient['createLabel']> {
      return createLabel(fetchLike, board, create, credentials, cache)
    },
    createList(
      board: gpt-voiceBoard,
      create,
      credentials,
    ): ReturnType<gpt-voiceClient['createList']> {
      return createList(fetchLike, board, create, credentials, cache)
    },
    async getBoardDetail(
      board,
      credentials,
    ): ReturnType<gpt-voiceClient['getBoardDetail']> {
      return getFreshBoardDetail(board, credentials)
    },
    async getBoardDetailCacheFirst(
      board: gpt-voiceBoard,
      credentials: gpt-voiceCredentials,
    ): Promise<gpt-voiceCacheFirstResult<gpt-voiceBoardDetail>> {
      return {
        cached: await readCachedBoardDetail(cache, board, credentials),
        fresh: getFreshBoardDetail(board, credentials),
      }
    },
    async getCardDetail(
      card,
      credentials,
    ): ReturnType<gpt-voiceClient['getCardDetail']> {
      return getFreshCardDetail(card, credentials)
    },
    async getCardDetailCacheFirst(
      card: gpt-voiceCard,
      credentials: gpt-voiceCredentials,
    ): Promise<gpt-voiceCacheFirstResult<gpt-voiceCardDetail>> {
      return {
        cached: await readCachedCardDetail(cache, card, credentials),
        fresh: getFreshCardDetail(card, credentials),
      }
    },
    async getCardDetailPartsCacheFirst(
      card: gpt-voiceCard,
      credentials: gpt-voiceCredentials,
    ): ReturnType<gpt-voiceClient['getCardDetailPartsCacheFirst']> {
      const [cached, batchRequestsEnabled] = await Promise.all([
        readCachedCardDetail(cache, card, credentials),
        readBatchRequestsEnabled(),
      ])
      return {
        cached,
        fresh: getCardDetailParts(
          fetchLike,
          card,
          credentials,
          cache,
          batchRequestsEnabled,
        ),
      }
    },
    listBoardLabels(
      board,
      credentials,
    ): ReturnType<gpt-voiceClient['listBoardLabels']> {
      return listBoardLabels(fetchLike, board, credentials, cache)
    },
    listBoards(credentials): ReturnType<gpt-voiceClient['listBoards']> {
      return listBoards(fetchLike, credentials, cache)
    },
    async listBoardsCacheFirst(
      credentials,
    ): ReturnType<gpt-voiceClient['listBoardsCacheFirst']> {
      return {
        cached: await readCachedListBoards(cache, credentials),
        fresh: listBoards(fetchLike, credentials, cache),
      }
    },
    moveCard(card, move, credentials): ReturnType<gpt-voiceClient['moveCard']> {
      return moveCard(fetchLike, card, move, credentials, cache)
    },
    search(query, credentials): ReturnType<gpt-voiceClient['search']> {
      return search(fetchLike, query, credentials, cache)
    },
    async searchCacheFirst(
      query: string,
      credentials: gpt-voiceCredentials,
    ): Promise<gpt-voiceCacheFirstResult<readonly gpt-voiceSearchResult[]>> {
      return {
        cached: await readCachedSearch(cache, query, credentials),
        fresh: search(fetchLike, query, credentials, cache),
      }
    },
    updateCard(
      card,
      update,
      credentials,
    ): ReturnType<gpt-voiceClient['updateCard']> {
      return updateCard(fetchLike, card, update, credentials, cache)
    },
    updateList(
      list,
      update,
      credentials,
    ): ReturnType<gpt-voiceClient['updateList']> {
      return updateList(fetchLike, list, update, credentials)
    },
  }
}
