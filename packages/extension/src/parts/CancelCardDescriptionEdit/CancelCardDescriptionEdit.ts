import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const cancelCardDescriptionEdit = (
  context: gpt-voiceViewActionContext,
): void => {
  const state = context.state as gpt-voiceViewState
  state.draftCardDescription = state.selectedCardDetail?.card.desc || ''
  state.editingCardDescription = false
  state.focusedName = ''
  state.error = ''
  context.requestRerender()
}
