import type { gpt-voiceCard, gpt-voiceCardMove } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const moveBoardDetailCard = (
  state: Readonly<gpt-voiceViewState>,
  card: Readonly<gpt-voiceCard>,
  targetListId: string,
  position: gpt-voiceCardMove['pos'],
): void => {
  const mutableState = state as gpt-voiceViewState
  if (!mutableState.boardDetail) {
    return
  }
  mutableState.boardDetail = {
    ...mutableState.boardDetail,
    lists: mutableState.boardDetail.lists.map((list) => {
      const cardsWithoutMoved = list.cards.filter((item) => {
        return item.id !== card.id
      })
      if (list.id !== targetListId) {
        return {
          ...list,
          cards: cardsWithoutMoved,
        }
      }
      return {
        ...list,
        cards:
          position === 'top'
            ? [card, ...cardsWithoutMoved]
            : [...cardsWithoutMoved, card],
      }
    }),
  }
}
