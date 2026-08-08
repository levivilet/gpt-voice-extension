import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.chat-messages'

export const test: Test = async ({ Command, expect, Locator, SideBar }) => {
  await Command.executeExtensionCommand('GptVoice.setIsTest')
  await SideBar.open('gpt-voice.views.default')

  await Command.executeExtensionCommand(
    'GptVoice.addTranscript',
    'user-message',
    'How is the weather today?',
    'user',
  )
  await Command.executeExtensionCommand(
    'GptVoice.addTranscript',
    'assistant-message',
    'It is sunny and warm.',
    'ai',
  )

  const userMessage = Locator('.GptVoiceTranscriptItemUser')
  const assistantMessage = Locator('.GptVoiceTranscriptItemAi')

  await expect(userMessage).toHaveText('How is the weather today?')
  await expect(userMessage).toHaveCSS('align-self', 'flex-end')
  await expect(userMessage).toHaveCSS('border-bottom-right-radius', '6px')
  await expect(assistantMessage).toHaveText('It is sunny and warm.')
  await expect(assistantMessage).toHaveCSS('align-self', 'flex-start')
  await expect(assistantMessage).toHaveCSS('border-bottom-left-radius', '6px')
}
