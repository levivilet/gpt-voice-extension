import {
  activate as activateExtensionApi,
  executeCommand,
  registerCommand,
  registerView,
} from '@lvce-editor/api'
import {
  createCacheCredentialStorage,
  testCacheName as testCredentialCacheName,
} from '../CredentialStorage/CredentialStorage.ts'
import {
  createCacheCurrentBoardStorage,
  testCacheName as testCurrentBoardCacheName,
} from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import {
  createMockgpt-voiceClient,
  type Mockgpt-voiceData,
} from '../Mockgpt-voiceClient/Mockgpt-voiceClient.ts'
import {
  createCacheRecentBoardStorage,
  testCacheName as testRecentBoardCacheName,
} from '../RecentBoardStorage/RecentBoardStorage.ts'
import { cleargpt-voiceTestCaches } from '../TestStorage/TestStorage.ts'
import * as gpt-voiceView from '../gpt-voiceView/gpt-voiceView.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerView(gpt-voiceView.view)
  registerCommand({
    execute() {
      return executeCommand('Layout.toggleSideBarView', gpt-voiceView.viewId)
    },
    id: 'gpt-voice.show',
  })
  registerCommand({
    execute() {
      return gpt-voiceView.cancelNewCardActivegpt-voiceViewInstance()
    },
    id: 'gpt-voice.cancelNewCard',
  })
  registerCommand({
    execute() {
      return gpt-voiceView.closeCardDetailActivegpt-voiceViewInstance()
    },
    id: 'gpt-voice.closeCardDetail',
  })
  registerCommand({
    execute() {
      return gpt-voiceView.closeBoardFilterActivegpt-voiceViewInstance()
    },
    id: 'gpt-voice.closeBoardFilter',
  })
  registerCommand({
    execute(cardId: string) {
      return gpt-voiceView.openCardActivegpt-voiceViewInstance(cardId)
    },
    id: 'gpt-voice.openCard',
  })
  registerCommand({
    execute() {
      return gpt-voiceView.saveCardDetailActivegpt-voiceViewInstance()
    },
    id: 'gpt-voice.saveCardDetail',
  })
  registerCommand({
    execute(listId: string) {
      return gpt-voiceView.startAddCardActivegpt-voiceViewInstance(listId)
    },
    id: 'gpt-voice.startAddCard',
  })
  registerCommand({
    execute() {
      return gpt-voiceView.submitNewCardActivegpt-voiceViewInstance()
    },
    id: 'gpt-voice.submitNewCard',
  })
  registerCommand({
    execute(options: any) {
      return gpt-voiceView.addList(options)
    },
    id: 'gpt-voice.addList',
  })
  registerCommand({
    execute(options: any) {
      return gpt-voiceView.openMockBoard(options)
    },
    id: 'gpt-voice.openMockBoard',
  })
  registerCommand({
    execute(options: any) {
      return gpt-voiceView.addCard(options)
    },
    id: 'gpt-voice.addCard',
  })
  registerCommand({
    async execute(data: Readonly<Mockgpt-voiceData>) {
      await cleargpt-voiceTestCaches()
      gpt-voiceView.setgpt-voiceViewDependencyFactory(() => ({
        client: createMockgpt-voiceClient(data),
        currentBoardStorage: createCacheCurrentBoardStorage(
          testCurrentBoardCacheName,
        ),
        isTest: true,
        readCardDetailPopupEnabled:
          gpt-voiceView.readCardDetailPopupEnabledPreference,
        recentStorage: createCacheRecentBoardStorage(testRecentBoardCacheName),
        storage: createCacheCredentialStorage(testCredentialCacheName),
      }))
      await gpt-voiceView.reloadActivegpt-voiceViewInstances()
      return { ok: true }
    },
    id: 'gpt-voice.test.useMockData',
  })
  registerCommand({
    async execute() {
      gpt-voiceView.resetgpt-voiceViewDependencyFactory()
      await gpt-voiceView.reloadActivegpt-voiceViewInstances()
      return { ok: true }
    },
    id: 'gpt-voice.test.reset',
  })
}

export const deactivate = (): void => {}
