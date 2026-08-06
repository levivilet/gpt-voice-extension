import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_gpt-voice.virtual-dom-view.filtering.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.filter-label'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ Command, expect, Locator })

  await Locator('input[name="boardFilter"]').type('ready FOR')
  await Command.execute('Timeout.sleep', 100)

  const cards = Locator('.gpt-voiceCard')
  const matchingCard = Locator('button[name="card:card-label"]')
  const hiddenCard = Locator('button[name="card:card-blocked"]')
  await expect(cards).toHaveCount(1)
  await expect(matchingCard).toBeVisible()
  await expect(hiddenCard).toHaveCount(0)
}
