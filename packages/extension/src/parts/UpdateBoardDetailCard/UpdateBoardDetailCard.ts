import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const updateBoardDetailCard = (
  state: Readonly<gpt-voiceViewState>,
  card: gpt-voiceCard,
): void => {
  const mutableState = state as gpt-voiceViewState
  if (!mutableState.boardDetail) {
    return
  }
  mutableState.boardDetail = {
    ...mutableState.boardDetail,
    lists: mutableState.boardDetail.lists.map((list) => {
      return {
        ...list,
        cards: list.cards.map((item) => {
          if (item.id !== card.id) {
            return item
          }
          return {
            ...item,
            ...card,
          }
        }),
      }
    }),
  }
}
