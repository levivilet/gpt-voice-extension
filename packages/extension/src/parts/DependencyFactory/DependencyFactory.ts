import * as ExtensionApi from '@lvce-editor/api'
import type { gpt-voiceViewDependencies } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import {
  batchRequestsEnabledPreference,
  boardBackgroundEnabledPreference,
  cardDetailPopupEnabledPreference,
  searchEnabledPreference,
} from '../Constants/Constants.ts'
import { createSecretCredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import { createCacheCurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import { createCacheRecentBoardStorage } from '../RecentBoardStorage/RecentBoardStorage.ts'
import { creategpt-voiceClient } from '../gpt-voiceClient/gpt-voiceClient.ts'
import { creategpt-voiceImageCache } from '../gpt-voiceImageCache/gpt-voiceImageCache.ts'

type DependencyFactory = () => gpt-voiceViewDependencies

const readSearchEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(searchEnabledPreference)) === true
}

const readBoardBackgroundEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(boardBackgroundEnabledPreference)) === true
}

export const readCardDetailPopupEnabledPreference =
  async (): Promise<boolean> => {
    const api = ExtensionApi as unknown as {
      readonly getPreference?: (key: string) => Promise<unknown>
    }
    return (
      (await api.getPreference?.(cardDetailPopupEnabledPreference)) === true
    )
  }

const readBatchRequestsEnabledPreference = async (): Promise<boolean> => {
  const api = ExtensionApi as unknown as {
    readonly getPreference?: (key: string) => Promise<unknown>
  }
  return (await api.getPreference?.(batchRequestsEnabledPreference)) === true
}

const defaultDependencyFactory = (): gpt-voiceViewDependencies => ({
  client: creategpt-voiceClient(undefined, undefined, {
    readBatchRequestsEnabled: readBatchRequestsEnabledPreference,
  }),
  currentBoardStorage: createCacheCurrentBoardStorage(),
  imageCache: creategpt-voiceImageCache(),
  readBoardBackgroundEnabled: readBoardBackgroundEnabledPreference,
  readCardDetailPopupEnabled: readCardDetailPopupEnabledPreference,
  readSearchEnabled: readSearchEnabledPreference,
  recentStorage: createCacheRecentBoardStorage(),
  storage: createSecretCredentialStorage(ExtensionApi),
})

export const dependencyState: { factory: DependencyFactory } = {
  factory: defaultDependencyFactory,
}

export const setgpt-voiceViewDependencyFactory = (
  factory: DependencyFactory,
): void => {
  dependencyState.factory = factory
}

export const resetgpt-voiceViewDependencyFactory = (): void => {
  dependencyState.factory = defaultDependencyFactory
}
