import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.virtual-dom-view.user-select-text'

export const test: Test = async ({ Command, expect, Locator }) => {
  const welcomeText = Locator('.gpt-voiceWelcomeText')
  await expect(welcomeText).toBeVisible()
  await expect(welcomeText).toHaveCSS('user-select', 'text')
}
