import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const contextKeyBoardDetailFocus = 'gpt-voice.boardDetailFocus'
export const contextKeyBoardFilterFocus = 'gpt-voice.boardFilterFocus'
export const contextKeyBoardsFocus = 'gpt-voice.boardsFocus'
export const contextKeyCardDescriptionFocus = 'gpt-voice.cardDescriptionFocus'
export const contextKeyCardDetailFocus = 'gpt-voice.cardDetailFocus'
export const contextKeyCardLabelPickerFocus = 'gpt-voice.cardLabelPickerFocus'
export const contextKeyNewCardInputFocus = 'gpt-voice.newCardInputFocus'
export const contextKeyNewListInputFocus = 'gpt-voice.newListInputFocus'

export const updateContext = (state: Readonly<gpt-voiceViewState>): void => {
  const context: Record<string, boolean> = {}
  if (state.credentials && state.boardDetail) {
    context[contextKeyBoardDetailFocus] = true
  }
  if (state.boardFilterOpen) {
    context[contextKeyBoardFilterFocus] = true
  }
  if (state.credentials && !state.boardDetail) {
    context[contextKeyBoardsFocus] = true
  }
  if (state.selectedCardDetail && !state.boardFilterOpen) {
    context[contextKeyCardDetailFocus] = true
  }
  if (state.cardLabelPickerOpen && state.focusedName === 'cardLabelSearch') {
    context[contextKeyCardLabelPickerFocus] = true
  }
  if (
    state.focusedName === 'cardDescription' &&
    state.selectedCardDetail &&
    state.editingCardDescription
  ) {
    context[contextKeyCardDescriptionFocus] = true
  }
  if (
    state.addingCardListId &&
    state.focusedName === `newCardTitle:${state.addingCardListId}`
  ) {
    context[contextKeyNewCardInputFocus] = true
  }
  if (state.addingList && state.focusedName === 'newListTitle') {
    context[contextKeyNewListInputFocus] = true
  }
  const mutableState = state as gpt-voiceViewState
  mutableState.context = context
}
