import type { gpt-voiceApiCache } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceCredentials,
  gpt-voiceLabel,
  gpt-voiceLabelCreate,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { deleteCachedBoardLabels } from '../ListBoardLabels/ListBoardLabels.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const createLabel = async (
  fetchLike: FetchLike,
  board: gpt-voiceBoard,
  create: gpt-voiceLabelCreate,
  credentials: gpt-voiceCredentials,
  cache?: gpt-voiceApiCache,
): Promise<gpt-voiceLabel> => {
  const label = await requestJson<gpt-voiceLabel>(
    fetchLike,
    '/labels',
    credentials,
    {
      color: create.color,
      idBoard: board.id,
      name: create.name,
    },
    {
      method: 'POST',
    },
  )
  await deleteCachedBoardLabels(cache, board.id, credentials)
  return label
}
