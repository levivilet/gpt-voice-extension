import { testCacheName as testCredentialCacheName } from '../CredentialStorage/CredentialStorage.ts'
import { testCacheName as testCurrentBoardCacheName } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import { testCacheName as testRecentBoardCacheName } from '../RecentBoardStorage/RecentBoardStorage.ts'
import { testgpt-voiceApiCacheName } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'
import { testgpt-voiceImageCacheName } from '../gpt-voiceImageCache/gpt-voiceImageCache.ts'

export const testCacheNames = [
  testCredentialCacheName,
  testCurrentBoardCacheName,
  testRecentBoardCacheName,
  testgpt-voiceApiCacheName,
  testgpt-voiceImageCacheName,
] as const

export const cleargpt-voiceTestCaches = async (
  cacheStorage: Readonly<CacheStorage> | undefined = globalThis.caches,
): Promise<void> => {
  if (!cacheStorage) {
    return
  }
  await Promise.all(
    testCacheNames.map((cacheName) => {
      return cacheStorage.delete(cacheName)
    }),
  )
}
