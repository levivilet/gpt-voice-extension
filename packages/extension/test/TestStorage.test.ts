import { expect, test } from '@jest/globals'
import {
  cacheName as credentialCacheName,
  testCacheName as testCredentialCacheName,
} from '../src/parts/CredentialStorage/CredentialStorage.ts'
import {
  cleargpt-voiceTestCaches,
  testCacheNames,
} from '../src/parts/TestStorage/TestStorage.ts'

test('cleargpt-voiceTestCaches deletes only test cache names', async () => {
  const deleted: string[] = []
  const cacheStorage = {
    async delete(cacheName: string): Promise<boolean> {
      deleted.push(cacheName)
      return true
    },
  } as unknown as CacheStorage

  await cleargpt-voiceTestCaches(cacheStorage)

  expect(deleted).toEqual([...testCacheNames])
  expect(deleted).toContain(testCredentialCacheName)
  expect(deleted).not.toContain(credentialCacheName)
})

test('cleargpt-voiceTestCaches does nothing when Cache Storage is unavailable', async () => {
  const originalCaches = globalThis.caches
  Object.defineProperty(globalThis, 'caches', {
    configurable: true,
    value: undefined,
  })

  try {
    await expect(cleargpt-voiceTestCaches()).resolves.toBeUndefined()
  } finally {
    Object.defineProperty(globalThis, 'caches', {
      configurable: true,
      value: originalCaches,
    })
  }
})
