import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const getCardListId = (
  state: Readonly<gpt-voiceViewState>,
  card: Readonly<gpt-voiceCard>,
): string => {
  if (card.idList) {
    return card.idList
  }
  const { boardDetail } = state
  const lists = boardDetail?.lists || []
  const list = lists.find((item) => {
    return item.cards.some((listCard) => {
      return listCard.id === card.id
    })
  })
  return list?.id || ''
}
