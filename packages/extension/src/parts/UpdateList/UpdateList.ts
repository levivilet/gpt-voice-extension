import type { FetchLike } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceCredentials,
  gpt-voiceList,
  gpt-voiceListUpdate,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { requestJson } from '../RequestJson/RequestJson.ts'

export const updateList = async (
  fetchLike: FetchLike,
  list: gpt-voiceList,
  update: gpt-voiceListUpdate,
  credentials: gpt-voiceCredentials,
): Promise<gpt-voiceList> => {
  const updatedList = await requestJson<Omit<gpt-voiceList, 'cards'>>(
    fetchLike,
    `/lists/${list.id}`,
    credentials,
    {
      fields: 'name',
      name: update.name,
    },
    {
      method: 'PUT',
    },
  )
  return {
    ...list,
    ...updatedList,
  }
}
