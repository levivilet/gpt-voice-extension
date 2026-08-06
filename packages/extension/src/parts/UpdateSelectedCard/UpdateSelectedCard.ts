import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const updateSelectedCard = (
  state: Readonly<gpt-voiceViewState>,
  card: Readonly<gpt-voiceCard>,
): void => {
  const mutableState = state as gpt-voiceViewState
  if (mutableState.selectedCardDetail?.card.id !== card.id) {
    return
  }
  mutableState.selectedCardDetail = {
    ...mutableState.selectedCardDetail,
    card: {
      ...mutableState.selectedCardDetail.card,
      ...card,
    },
  }
}
