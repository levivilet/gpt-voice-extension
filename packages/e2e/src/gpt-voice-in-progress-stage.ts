import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.in-progress-stage'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  // arrange
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await SideBar.open('gpt-voice.views.default')
  const button = Locator('.GptVoiceButton')
  await expect(button).toBeVisible()
  await Command.executeExtensionCommand('GptVoice.handleClickStart')

  // assert
  const listeningBubble = Locator('.GptVoiceBubble.listening')
  await expect(listeningBubble).toBeVisible()
}
