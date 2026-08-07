import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.set-animation'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  // arrange
  await SideBar.open('gpt-voice.views.default')
  const button = Locator('.GptVoiceButton')
  await expect(button).toBeVisible()
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await Command.executeExtensionCommand('GptVoice.handleClickStart')

  // act
  await Command.executeExtensionCommand('GptVoice.setAnimation', true, 2.1)

  // assert
  const bubble = Locator('.GptVoiceBubble')
  await expect(bubble).toBeVisible()
  await expect(bubble).toHaveCSS(`transform`, `scale(2.1)`)
}
