import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.layout'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await SideBar.open('gpt-voice.views.default')

  const main = Locator('.GptVoice')
  const toolbar = Locator('.GptVoiceToolbar')
  const transcript = Locator('.GptVoiceTranscript')

  await expect(main).toHaveCSS('justify-content', 'flex-start')
  await expect(toolbar).toHaveCSS('display', 'flex')
  await expect(transcript).toHaveCSS('flex-grow', '1')
  await expect(transcript).toHaveCSS('overflow-y', 'auto')
}
