import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const editCardTitle = (context: gpt-voiceViewActionContext): void => {
  const state = context.state as gpt-voiceViewState
  state.editingCardTitle = true
  context.requestRerender()
}

export const editCardDescription = (context: gpt-voiceViewActionContext): void => {
  const state = context.state as gpt-voiceViewState
  state.editingCardDescription = true
  state.focusedName = 'cardDescription'
  context.requestRerender()
}
