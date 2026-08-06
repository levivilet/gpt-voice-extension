import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'
import { updateBoardDetailCard } from '../UpdateBoardDetailCard/UpdateBoardDetailCard.ts'

const updateCardCommentCount = (card: Readonly<gpt-voiceCard>): gpt-voiceCard => {
  const count = card.badges?.comments || 0
  return {
    ...card,
    badges: {
      ...card.badges,
      comments: count + 1,
    },
  }
}

export const startWriteComment = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.selectedCardDetail) {
    return
  }
  state.writingComment = true
  state.draftComment = ''
  state.focusedName = 'cardComment'
  state.error = ''
  requestRerender()
}

export const cancelWriteComment = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.writingComment = false
  state.draftComment = ''
  state.savingComment = false
  state.error = ''
  requestRerender()
}

export const submitComment = async (
  context: Readonly<gpt-voiceViewActionContext>,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || !state.selectedCardDetail || state.savingComment) {
    return
  }
  const text = state.draftComment.trim()
  if (!text) {
    state.error = gpt-voiceStrings.commentRequired()
    requestRerender()
    return
  }
  state.savingComment = true
  state.error = ''
  requestRerender()
  try {
    const comment = await client.addCardComment(
      state.selectedCardDetail.card,
      text,
      state.credentials,
    )
    const card = updateCardCommentCount(state.selectedCardDetail.card)
    state.selectedCardDetail = {
      ...state.selectedCardDetail,
      card,
      comments: [...state.selectedCardDetail.comments, comment],
    }
    updateBoardDetailCard(state, card)
    state.writingComment = false
    state.draftComment = ''
  } catch (error) {
    state.error = getErrorMessage(error)
  }
  state.savingComment = false
  requestRerender()
}
