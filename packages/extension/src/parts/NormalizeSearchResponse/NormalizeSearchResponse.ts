import type {
  gpt-voiceBoard,
  gpt-voiceCard,
  gpt-voiceSearchResult,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'

export interface gpt-voiceSearchResponse {
  readonly boards?: readonly gpt-voiceBoard[]
  readonly cards?: readonly gpt-voiceCard[]
}

export const normalizeSearchResponse = (
  response: Readonly<gpt-voiceSearchResponse>,
): readonly gpt-voiceSearchResult[] => {
  const cards = response.cards || []
  const boards = response.boards || []
  return [
    ...cards.map((card): gpt-voiceSearchResult => {
      return {
        ...card,
        type: 'card',
      }
    }),
    ...boards.map((board): gpt-voiceSearchResult => {
      return {
        ...board,
        type: 'board',
      }
    }),
  ]
}
