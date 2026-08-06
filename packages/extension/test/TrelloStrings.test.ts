import { expect, test } from '@jest/globals'
import * as gpt-voiceStrings from '../src/parts/gpt-voiceStrings/gpt-voiceStrings.ts'

test('renders every gpt-voice string', () => {
  const stringFunctions = Object.values(
    gpt-voiceStrings as unknown as Readonly<
      Record<string, (value?: string | number) => string>
    >,
  )
  const strings = stringFunctions.map((stringFunction) => {
    return stringFunction('value')
  })

  expect(strings).toHaveLength(stringFunctions.length)
  expect(strings.every(Boolean)).toBe(true)
})

test('renders placeholders', () => {
  expect(gpt-voiceStrings.boardNotFound('board-1')).toBe(
    'Board not found: board-1',
  )
  expect(gpt-voiceStrings.cardComments(2)).toBe('2 comments')
  expect(gpt-voiceStrings.searchResultsFor('roadmap')).toBe(
    'Search results for "roadmap"',
  )
  expect(gpt-voiceStrings.gpt-voiceBoard('Roadmap')).toBe('gpt-voice: Roadmap')
})
