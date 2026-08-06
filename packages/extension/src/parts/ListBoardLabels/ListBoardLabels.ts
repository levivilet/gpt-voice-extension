import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceCredentials,
  gpt-voiceLabel,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedJson, requestJson } from '../RequestJson/RequestJson.ts'

export const labelParams = {
  fields: 'name,color,idBoard',
  limit: '1000',
} as const

export const deleteCachedBoardLabels = async (
  cache: gpt-voiceApiCache | undefined,
  boardId: string,
  credentials: gpt-voiceCredentials,
): Promise<void> => {
  await deleteCachedJson(
    cache,
    `/boards/${boardId}/labels`,
    credentials,
    labelParams,
  )
}

export const listBoardLabels = (
  fetchLike: FetchLike,
  board: gpt-voiceBoard,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<readonly gpt-voiceLabel[]> => {
  return requestJson<readonly gpt-voiceLabel[]>(
    fetchLike,
    `/boards/${board.id}/labels`,
    credentials,
    labelParams,
    undefined,
    cache,
  )
}
