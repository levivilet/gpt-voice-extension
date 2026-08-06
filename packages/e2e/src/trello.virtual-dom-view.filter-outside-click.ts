import type { Test } from '@lvce-editor/test-with-playwright'
import {
  openBoardFilter,
  showFilteringBoard,
} from './_gpt-voice.virtual-dom-view.filtering.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.filter-outside-click'

export const test: Test = async ({ Command, expect, Locator }) => {
  await showFilteringBoard({ Command, expect, Locator })
  await openBoardFilter({ Command, expect, Locator })

  const input = Locator('input[name="boardFilter"]')
  const cards = Locator('.gpt-voiceCard')
  const popup = Locator('.gpt-voiceBoardFilterPopup')
  await input.type('ready')
  await Command.execute('Timeout.sleep', 100)
  await expect(cards).toHaveCount(1)

  const overlay = Locator('.gpt-voiceBoardFilterOverlay')
  // eslint-disable-next-line e2e/no-direct-click
  await overlay.click()
  await Command.execute('Timeout.sleep', 100)

  await expect(popup).toHaveCount(0)
  await expect(cards).toHaveCount(1)
}
