import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.button-click'

export const skip = 1

export const test: Test = async ({
  expect,
  Locator,
  SideBar,
  Command,
  Layout,
}) => {
  await SideBar.open('gpt-voice.views.default')
  const button = Locator('.GptVoiceButton')
  await expect(button).toBeVisible()
  await Command.executeExtensionCommand('GptVoice.handleClickStart')
}
