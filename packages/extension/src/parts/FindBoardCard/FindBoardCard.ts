import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const findBoardCard = (
  state: Readonly<gpt-voiceViewState>,
  cardId: string,
): gpt-voiceCard | undefined => {
  const lists = state.boardDetail?.lists || []
  for (const list of lists) {
    const card = list.cards.find((item) => item.id === cardId)
    if (card) {
      return card
    }
  }
  return undefined
}
