import type * as LvceApi from '@lvce-editor/api'
import { expect, jest, test } from '@jest/globals'

const activateExtensionApi = jest.fn(async () => {})
const executeCommand = jest.fn(
  async (_id: string, ..._args: readonly unknown[]): Promise<unknown> =>
    undefined,
)
const readMicLevels = jest.fn(async () => ({
  micAnalyzerData: [],
  remoteAnalyzerData: [],
}))
const registeredCommands: LvceApi.Command[] = []
const registerCommand = jest.fn((command: LvceApi.Command) => {
  registeredCommands.push(command)
  return {
    dispose: jest.fn(),
  }
})
const registerView = jest.fn(() => ({
  dispose: jest.fn(),
}))

// eslint-disable-next-line jest/no-restricted-jest-methods
jest.unstable_mockModule('@lvce-editor/api', () => {
  const actual = jest.requireActual<typeof LvceApi>('@lvce-editor/api')
  return {
    ...actual,
    activate: activateExtensionApi,
    deleteSecret: jest.fn(),
    executeCommand,
    getSecret: jest.fn(),
    readMicLevels,
    registerCommand,
    registerView,
    setRemoteDescription: jest.fn(),
    startWebRtcAudioStream: jest.fn(),
    stopWebRtcAudioStream: jest.fn(),
    storeSecret: jest.fn(),
  }
})

const Main = await import('../src/parts/Main/Main.ts')

test('gpt-voice.show command opens floating extension window url', async () => {
  await Main.activate()

  expect(registerCommand).toHaveBeenCalledTimes(1)
  const openFloatingCommand = registeredCommands.at(0)
  if (!openFloatingCommand) {
    throw new Error('Expected open floating command')
  }
  expect(openFloatingCommand.id).toBe('gpt-voice.show')
  await openFloatingCommand.execute()

  expect(executeCommand).toHaveBeenCalledWith(
    'Open.openUrl',
    'lvce-oss://-/?floatingWindowMode=extensionView&floatingExtensionViewId=gpt-voice.views.default',
  )
  expect(registerView).toHaveBeenCalledTimes(1)
  expect(activateExtensionApi).toHaveBeenCalledTimes(1)
})
