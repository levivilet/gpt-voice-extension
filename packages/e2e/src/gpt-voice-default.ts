import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.basic'

export const test: Test = async ({ expect, Locator }) => {
  const main = Locator('.gpt-voice')
  await expect(main).toBeVisible()
}
