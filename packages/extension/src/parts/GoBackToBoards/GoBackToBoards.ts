import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { clearBoardSpecificState } from '../ClearBoardSpecificState/ClearBoardSpecificState.ts'

export const goBackToBoards = async (
  context: gpt-voiceViewActionContext,
): Promise<void> => {
  const { currentBoardStorage, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  clearBoardSpecificState(state)
  state.error = ''
  await currentBoardStorage.delete()
  requestRerender()
}
