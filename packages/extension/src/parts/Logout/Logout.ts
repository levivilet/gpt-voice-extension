import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { createInitialState } from '../CreateInitialState/CreateInitialState.ts'

export const logout = async (
  context: gpt-voiceViewActionContext,
): Promise<void> => {
  const {
    currentBoardStorage,
    imageCache,
    recentStorage,
    requestRerender,
    storage,
  } = context
  const state = context.state as gpt-voiceViewState
  await storage.delete()
  await recentStorage.delete()
  await currentBoardStorage.delete()
  imageCache.dispose()
  Object.assign(state, createInitialState())
  requestRerender()
}
