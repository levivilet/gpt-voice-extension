import type { gpt-voiceCardDetail } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const isSameJson = (a: unknown, b: unknown): boolean => {
  return JSON.stringify(a) === JSON.stringify(b)
}

export const applyCardDetail = (
  state: Readonly<gpt-voiceViewState>,
  cardDetail: gpt-voiceCardDetail,
): void => {
  const mutableState = state as gpt-voiceViewState
  mutableState.selectedCardDetail = cardDetail
  mutableState.draftCardTitle = cardDetail.card.name
  mutableState.draftCardDescription = cardDetail.card.desc || ''
  mutableState.editingCardDescription = false
  mutableState.editingCardTitle = false
}
