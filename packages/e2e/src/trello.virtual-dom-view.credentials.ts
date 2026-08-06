import type { Test } from '@lvce-editor/test-with-playwright'
import {
  createBoards,
  createMockData,
} from './_gpt-voice.virtual-dom-view.shared.ts'

export const name = 'gpt-voice.virtual-dom-view.credentials'
// export const skip = true

export const test: Test = async ({ Command, expect, Locator }) => {
  let step = 'start'
  try {
    step = 'create boards'
    const boards = createBoards(1)
    const mockData = createMockData(boards)
    step = 'reset'
    step = 'use mock data'
    await Command.executeExtensionCommand(
      'gpt-voice.test.useMockData',
      mockData,
    )
    step = 'show gpt-voice'
    await Command.executeExtensionCommand('gpt-voice.show')

    step = 'locate inputs'
    const apiKeyInput = Locator('input[name="apiKey"]')
    const tokenInput = Locator('input[name="token"]')
    step = 'expect inputs'
    await expect(apiKeyInput).toBeVisible()
    await expect(tokenInput).toBeVisible()

    step = 'expect auth form width'
    const authForm = Locator('.gpt-voiceAuthForm')
    await expect(authForm).toHaveCSS('max-width', '760px')

    step = 'expect auth inputs wrapper'
    const authFields = Locator('.gpt-voiceAuthFields > .gpt-voiceField')
    await expect(authFields).toHaveCount(2)

    step = 'expect no duplicate title'
    const authTitle = Locator('.gpt-voiceAuthForm > .gpt-voiceTitle')
    await expect(authTitle).toHaveCount(0)

    step = 'locate labels'
    const apiKey = Locator('text=API key')
    const token = Locator('text=Token')

    step = 'expect labels'
    await expect(apiKey).toBeVisible()
    await expect(token).toBeVisible()
  } catch (error) {
    throw new Error(`credentials failed at ${step}: ${error}`)
  }
}
