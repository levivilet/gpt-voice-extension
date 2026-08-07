import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.stage'

export const test: Test = async ({ expect, Locator, SideBar }) => {
  await SideBar.open('gpt-voice.views.default')
  const stage = Locator('.GptVoiceStage')
  await expect(stage).toBeVisible()
}
