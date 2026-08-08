import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.stage'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  await SideBar.open('gpt-voice.views.default')
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  const button = Locator('.GptVoiceButton')
  await Command.executeExtensionCommand('GptVoice.handleClickStart')
  await expect(button).toHaveText('Stop talking')
  const stage = Locator('.GptVoiceStage')
  await expect(stage).toBeVisible()
}
