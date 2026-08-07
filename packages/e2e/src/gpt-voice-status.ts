import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.status'

export const test: Test = async ({ expect, Locator, SideBar }) => {
  await SideBar.open('gpt-voice.views.default')
  const status = Locator('.GptVoiceStatus')
  await expect(status).toBeVisible()
}
