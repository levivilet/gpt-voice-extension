import type { gpt-voiceBoard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { isSameJson } from '../CacheFirstHelpers/CacheFirstHelpers.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'

const findBoard = (
  boards: readonly gpt-voiceBoard[],
  boardId: string,
): gpt-voiceBoard | undefined => {
  return boards.find((board) => {
    return board.id === boardId
  })
}

export const restoreCurrentBoard = async (
  context: Readonly<gpt-voiceViewActionContext>,
): Promise<void> => {
  const { client, currentBoardStorage } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || state.error) {
    return
  }
  const boardId = await currentBoardStorage.read()
  if (!boardId) {
    return
  }
  const board = findBoard(state.boards, boardId)
  if (!board) {
    await currentBoardStorage.delete()
    return
  }
  state.loading = true
  state.error = ''
  try {
    const result = await client.getBoardDetailCacheFirst(
      board,
      state.credentials,
    )
    if (result.cached) {
      state.boardDetail = result.cached
      state.loading = false
    }
    const fresh = await result.fresh
    if (!isSameJson(state.boardDetail, fresh)) {
      state.boardDetail = fresh
    }
  } catch (error) {
    state.error = getErrorMessage(error)
    await currentBoardStorage.delete()
  } finally {
    state.loading = false
  }
}
