import type { gpt-voiceCard, gpt-voiceList } from '../gpt-voiceTypes/gpt-voiceTypes.ts'

const includesQuery = (value: string | undefined, query: string): boolean => {
  return Boolean(value?.toLowerCase().includes(query))
}

export const cardMatchesFilter = (
  card: Readonly<gpt-voiceCard>,
  filterValue: string,
): boolean => {
  const query = filterValue.trim().toLowerCase()
  if (!query) {
    return true
  }
  return (
    includesQuery(card.name, query) ||
    includesQuery(card.desc, query) ||
    Boolean(
      card.labels?.some((label) => {
        return includesQuery(label.name, query)
      }),
    )
  )
}

export const filterListCards = (
  list: Readonly<gpt-voiceList>,
  filterValue: string,
): gpt-voiceList => {
  if (!filterValue.trim()) {
    return list
  }
  return {
    ...list,
    cards: list.cards.filter((card) => {
      return cardMatchesFilter(card, filterValue)
    }),
  }
}
