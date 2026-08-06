// cspell:ignore prefs

import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceCredentials,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { readCachedJson, requestJson } from '../RequestJson/RequestJson.ts'

const listBoardsParams = {
  fields: 'name,url,dateLastView,idOrganization,prefs',
  organization: 'true',
  organization_fields: 'name,displayName',
} as const

export const readCachedListBoards = (
  cache: gpt-voiceApiCache | undefined,
  credentials: gpt-voiceCredentials,
): Promise<readonly gpt-voiceBoard[] | undefined> => {
  return readCachedJson<readonly gpt-voiceBoard[]>(
    cache,
    '/members/me/boards',
    credentials,
    listBoardsParams,
  )
}

export const listBoards = (
  fetchLike: FetchLike,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<readonly gpt-voiceBoard[]> => {
  return requestJson<readonly gpt-voiceBoard[]>(
    fetchLike,
    '/members/me/boards',
    credentials,
    listBoardsParams,
    undefined,
    cache,
  )
}
