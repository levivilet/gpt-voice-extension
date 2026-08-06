import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_gpt-voice.virtual-dom-view.filtering.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.filter-no-matches'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ Command, expect, Locator })

  await Locator('input[name="boardFilter"]').type('no such card')
  await Command.execute('Timeout.sleep', 100)

  const cards = Locator('.gpt-voiceCard')
  const lists = Locator('.gpt-voiceList')
  const noCards = Locator('text=No cards')
  const counts = Locator('.gpt-voiceListCardCount')
  const firstCount = counts.nth(0)
  const secondCount = counts.nth(1)
  await expect(cards).toHaveCount(0)
  await expect(lists).toHaveCount(2)
  await expect(noCards).toHaveCount(2)
  await expect(firstCount).toHaveText('0')
  await expect(secondCount).toHaveText('0')
}
