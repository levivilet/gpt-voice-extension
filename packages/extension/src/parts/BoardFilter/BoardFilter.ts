import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const openBoardFilter = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.boardFilterOpen = true
  state.focusedName = 'boardFilter'
  requestRerender()
}

export const closeBoardFilter = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.boardFilterOpen = false
  if (state.focusedName === 'boardFilter') {
    state.focusedName = ''
  }
  requestRerender()
}
