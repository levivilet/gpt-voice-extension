// cspell:ignore prefs

import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCredentials,
  gpt-voiceSearchResult,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import {
  normalizeSearchResponse,
  type gpt-voiceSearchResponse,
} from '../NormalizeSearchResponse/NormalizeSearchResponse.ts'
import { readCachedJson, requestJson } from '../RequestJson/RequestJson.ts'

const getSearchParams = (query: string): Readonly<Record<string, string>> => {
  return {
    board_fields: 'name,url,prefs',
    boards_limit: '10',
    card_fields: 'name,url,idBoard',
    cards_limit: '10',
    modelTypes: 'cards,boards',
    query,
  }
}

export const readCachedSearch = async (
  cache: gpt-voiceApiCache | undefined,
  query: string,
  credentials: gpt-voiceCredentials,
): Promise<readonly gpt-voiceSearchResult[] | undefined> => {
  const response = await readCachedJson<gpt-voiceSearchResponse>(
    cache,
    '/search',
    credentials,
    getSearchParams(query),
  )
  if (!response) {
    return undefined
  }
  return normalizeSearchResponse(response)
}

export const search = async (
  fetchLike: FetchLike,
  query: string,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<readonly gpt-voiceSearchResult[]> => {
  const response = await requestJson<gpt-voiceSearchResponse>(
    fetchLike,
    '/search',
    credentials,
    getSearchParams(query),
    undefined,
    cache,
  )
  return normalizeSearchResponse(response)
}
