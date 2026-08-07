import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.stop'

export const skip = 1

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  // arrange
  await SideBar.open('gpt-voice.views.default')
  const button = Locator('.GptVoiceButton')
  await expect(button).toBeVisible()
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await Command.executeExtensionCommand('GptVoice.handleClickStart')

  // act
  await Command.executeExtensionCommand('GptVoice.stop')

  // assert
  const listeningBubble = Locator('.GptVoiceBubble.listening')
  await expect(listeningBubble).toBeHidden()
}
