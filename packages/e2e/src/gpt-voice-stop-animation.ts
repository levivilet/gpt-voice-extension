import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.stop-animation'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  // arrange
  await SideBar.open('gpt-voice.views.default')
  const button = Locator('.GptVoiceButton')
  await expect(button).toBeVisible()
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await Command.executeExtensionCommand('GptVoice.handleClickStart')
  await Command.executeExtensionCommand('GptVoice.setAnimation', true, 2.1)
  // TODO avoid timeout
  await new Promise((r) => {
    setTimeout(r, 500)
  })

  // act
  await Command.executeExtensionCommand('GptVoice.setAnimation', false, 1)

  // assert
  const bubble = Locator('.GptVoiceBubble')
  await expect(bubble).toBeVisible()
  // TODO avoid timeout
  await new Promise((r) => {
    setTimeout(r, 500)
  })
  await expect(bubble).toHaveCSS(`transform`, `matrix(1, 0, 0, 1, 0, 0)`)
}
