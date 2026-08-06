import type { Test } from '@lvce-editor/test-with-playwright'

export const name = 'gpt-voice.virtual-dom-view.lazy-activation'

interface RunningExtension {
  readonly activationEvent: string
  readonly id: string
}

const extensionId = 'builtin.gpt-voice'
const viewId = 'gpt-voice.views.boards'

export const test: Test = async ({ Command, expect, Locator }) => {
  await Command.execute('ActivityBar.handleExtensionsChanged')

  const item = Locator('.ActivityBarItem[title="gpt-voice"]')
  await expect(item).toBeVisible()
  await expect(item).toHaveAttribute('aria-selected', 'false')

  const runningExtensionsBefore = (await Command.execute(
    'ExtensionManagement.getRunningExtensions',
  )) as readonly RunningExtension[]
  const extensionRunningBefore = runningExtensionsBefore.some(
    (extension) => extension.id === extensionId,
  )
  if (extensionRunningBefore) {
    throw new Error(
      `Expected ${extensionId} not to be running before its view becomes active`,
    )
  }

  await Command.execute(
    'ActivityBar.handleClick',
    0,
    0,
    0,
    'gpt-voice.views.boards',
  )

  const apiKey = Locator('input[name="apiKey"]')
  await expect(item).toHaveAttribute('aria-selected', 'true')
  await expect(apiKey).toBeVisible()

  const runningExtensionsAfter = (await Command.execute(
    'ExtensionManagement.getRunningExtensions',
  )) as readonly RunningExtension[]
  const extensionAfter = runningExtensionsAfter.find(
    (extension) => extension.id === extensionId,
  )
  if (!extensionAfter) {
    throw new Error(
      `Expected ${extensionId} to be running after its view becomes active`,
    )
  }
  if (extensionAfter.activationEvent !== `onView:${viewId}`) {
    throw new Error(`Expected ${extensionId} to be activated by ${viewId}`)
  }
}
