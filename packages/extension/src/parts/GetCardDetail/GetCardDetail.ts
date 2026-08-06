import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCard,
  gpt-voiceCardDetail,
  gpt-voiceCredentials,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import {
  deleteCachedJson,
  readCachedJson,
  requestJson,
  requestJsonBatch,
} from '../RequestJson/RequestJson.ts'

const cardParams = {
  fields: 'name,desc,url,idBoard,idList,labels',
} as const

const attachmentsParams = {
  fields: 'name,url,mimeType,previews',
} as const

const commentsParams = {
  fields: 'data,date,id',
  filter: 'commentCard',
  memberCreator: 'true',
  memberCreator_fields: 'avatarHash,avatarUrl,fullName,initials,username',
} as const

type gpt-voiceCardDetailBatchResult = readonly [
  gpt-voiceCard,
  gpt-voiceCardDetail['attachments'],
  gpt-voiceCardDetail['comments'],
]

const getBatchCard = async (
  result: Readonly<Promise<gpt-voiceCardDetailBatchResult>>,
): Promise<gpt-voiceCard> => {
  const values = await result
  return values[0]
}

const getBatchAttachments = async (
  result: Readonly<Promise<gpt-voiceCardDetailBatchResult>>,
): Promise<gpt-voiceCardDetail['attachments']> => {
  const values = await result
  return values[1]
}

const getBatchComments = async (
  result: Readonly<Promise<gpt-voiceCardDetailBatchResult>>,
): Promise<gpt-voiceCardDetail['comments']> => {
  const values = await result
  return values[2]
}

export const readCachedCardDetail = async (
  cache: gpt-voiceApiCache | undefined,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
): Promise<gpt-voiceCardDetail | undefined> => {
  const [detailCard, attachments, comments] = await Promise.all([
    readCachedJson<gpt-voiceCard>(
      cache,
      `/cards/${card.id}`,
      credentials,
      cardParams,
    ),
    readCachedJson<gpt-voiceCardDetail['attachments']>(
      cache,
      `/cards/${card.id}/attachments`,
      credentials,
      attachmentsParams,
    ),
    readCachedJson<gpt-voiceCardDetail['comments']>(
      cache,
      `/cards/${card.id}/actions`,
      credentials,
      commentsParams,
    ),
  ])
  if (!detailCard || !attachments || !comments) {
    return undefined
  }
  return {
    attachments,
    card: detailCard,
    comments,
  }
}

export const deleteCachedCardDetail = async (
  cache: gpt-voiceApiCache | undefined,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
): Promise<void> => {
  await deleteCachedJson(cache, `/cards/${card.id}`, credentials, cardParams)
}

export const deleteCachedCardComments = async (
  cache: gpt-voiceApiCache | undefined,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/cards/${card.id}/actions`,
    credentials,
    commentsParams,
  )
}

export const deleteCachedCardAttachments = async (
  cache: gpt-voiceApiCache | undefined,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/cards/${card.id}/attachments`,
    credentials,
    attachmentsParams,
  )
}

export const getCardDetailCard = (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCard> => {
  return requestJson<gpt-voiceCard>(
    fetchLike,
    `/cards/${card.id}`,
    credentials,
    cardParams,
    undefined,
    cache,
  )
}

export const getCardDetailAttachments = (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCardDetail['attachments']> => {
  return requestJson<gpt-voiceCardDetail['attachments']>(
    fetchLike,
    `/cards/${card.id}/attachments`,
    credentials,
    attachmentsParams,
    undefined,
    cache,
  )
}

export const getCardDetailComments = (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceCardDetail['comments']> => {
  return requestJson<gpt-voiceCardDetail['comments']>(
    fetchLike,
    `/cards/${card.id}/actions`,
    credentials,
    commentsParams,
    undefined,
    cache,
  )
}

export const getCardDetail = async (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
  batchRequestsEnabled = false,
): Promise<gpt-voiceCardDetail> => {
  const {
    attachments,
    card: detailCard,
    comments,
  } = getCardDetailParts(
    fetchLike,
    card,
    credentials,
    cache,
    batchRequestsEnabled,
  )
  const [resolvedCard, resolvedAttachments, resolvedComments] =
    await Promise.all([detailCard, attachments, comments])
  return {
    attachments: resolvedAttachments,
    card: resolvedCard,
    comments: resolvedComments,
  }
}

export const getCardDetailParts = (
  fetchLike: FetchLike,
  card: gpt-voiceCard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
  batchRequestsEnabled = false,
): {
  readonly attachments: Promise<gpt-voiceCardDetail['attachments']>
  readonly card: Promise<gpt-voiceCard>
  readonly comments: Promise<gpt-voiceCardDetail['comments']>
} => {
  if (!batchRequestsEnabled) {
    const detailCard = getCardDetailCard(fetchLike, card, credentials, cache)
    const attachments = getCardDetailAttachments(
      fetchLike,
      card,
      credentials,
      cache,
    )
    const comments = getCardDetailComments(fetchLike, card, credentials, cache)
    return {
      attachments,
      card: detailCard,
      comments,
    }
  }
  const result = requestJsonBatch<gpt-voiceCardDetailBatchResult>(
    fetchLike,
    [
      {
        params: cardParams,
        path: `/cards/${card.id}`,
      },
      {
        params: attachmentsParams,
        path: `/cards/${card.id}/attachments`,
      },
      {
        params: commentsParams,
        path: `/cards/${card.id}/actions`,
      },
    ],
    credentials,
    cache,
  )
  return {
    attachments: getBatchAttachments(result),
    card: getBatchCard(result),
    comments: getBatchComments(result),
  }
}
