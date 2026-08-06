import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { isSameJson } from '../CacheFirstHelpers/CacheFirstHelpers.ts'
import { clearBoardSpecificState } from '../ClearBoardSpecificState/ClearBoardSpecificState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'

export const loadBoards = async (
  context: gpt-voiceViewActionContext,
  rerender = true,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials) {
    return
  }
  state.loading = true
  state.error = ''
  clearBoardSpecificState(state)
  state.activeSearchQuery = ''
  state.searchResults = []
  try {
    const result = await client.listBoardsCacheFirst(state.credentials)
    if (result.cached) {
      state.boards = result.cached
      state.loading = false
      if (rerender) {
        requestRerender()
      }
    }
    const fresh = await result.fresh
    if (!isSameJson(state.boards, fresh)) {
      state.boards = fresh
    }
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.loading = false
  }
  if (rerender) {
    requestRerender()
  }
}
