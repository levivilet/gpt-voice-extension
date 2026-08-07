import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.set-transcript'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  // arrange
  await SideBar.open('gpt-voice.views.default')
  const button = Locator('.GptVoiceButton')
  await expect(button).toBeVisible()
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await Command.executeExtensionCommand('GptVoice.handleClickStart')

  // act
  const id = 'abcdef'
  await Command.executeExtensionCommand(
    'GptVoice.setTranscript',
    id,
    'hello world',
  )

  // assert
  const transcript = Locator('.GptVoiceTranscript')
  await expect(transcript).toBeVisible()
  await expect(transcript).toHaveText('hello world')
}
