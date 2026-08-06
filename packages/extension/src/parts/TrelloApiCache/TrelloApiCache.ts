import type { gpt-voiceCredentials } from '../gpt-voiceTypes/gpt-voiceTypes.ts'

export interface gpt-voiceApiCache {
  readonly delete: (
    requestUrl: string,
    credentials: gpt-voiceCredentials,
  ) => Promise<void>
  readonly read: <T>(
    requestUrl: string,
    credentials: gpt-voiceCredentials,
  ) => Promise<T | undefined>
  readonly write: <T>(
    requestUrl: string,
    credentials: gpt-voiceCredentials,
    value: T,
  ) => Promise<void>
}

export interface Memorygpt-voiceApiCache extends gpt-voiceApiCache {
  readonly keys: () => readonly string[]
}

export const gpt-voiceApiCacheName = 'builtin.gpt-voice.api-responses'
export const testgpt-voiceApiCacheName = 'test.builtin.gpt-voice.api-responses'
export const credentialFingerprintSearchParam = 'credential'

const textEncoder = new TextEncoder()

export const getCredentialFingerprint = async (
  credentials: gpt-voiceCredentials,
): Promise<string | undefined> => {
  const subtle = globalThis.crypto?.subtle
  if (!subtle) {
    return undefined
  }
  const value = textEncoder.encode(`${credentials.apiKey}:${credentials.token}`)
  const digest = await subtle.digest('SHA-256', value)
  return Array.from(new Uint8Array(digest), (byte) => {
    return byte.toString(16).padStart(2, '0')
  }).join('')
}

export const creategpt-voiceApiCacheRequestUrl = async (
  requestUrl: string,
  credentials: gpt-voiceCredentials,
): Promise<string | undefined> => {
  const credentialFingerprint = await getCredentialFingerprint(credentials)
  if (!credentialFingerprint) {
    return undefined
  }
  const url = new URL(requestUrl)
  url.searchParams.delete('key')
  url.searchParams.delete('token')
  url.searchParams.set(credentialFingerprintSearchParam, credentialFingerprint)
  url.searchParams.sort()
  return url.href
}

export const createCacheStoragegpt-voiceApiCache = (
  cacheStorage: Readonly<CacheStorage> | undefined = globalThis.caches,
  selectedCacheName = gpt-voiceApiCacheName,
): gpt-voiceApiCache | undefined => {
  if (!cacheStorage) {
    return undefined
  }
  return {
    async delete(
      requestUrl: string,
      credentials: gpt-voiceCredentials,
    ): Promise<void> {
      const cacheRequestUrl = await creategpt-voiceApiCacheRequestUrl(
        requestUrl,
        credentials,
      )
      if (!cacheRequestUrl) {
        return
      }
      const cache = await cacheStorage.open(selectedCacheName)
      await cache.delete(cacheRequestUrl)
    },
    async read<T>(
      requestUrl: string,
      credentials: gpt-voiceCredentials,
    ): Promise<T | undefined> {
      const cacheRequestUrl = await creategpt-voiceApiCacheRequestUrl(
        requestUrl,
        credentials,
      )
      if (!cacheRequestUrl) {
        return undefined
      }
      const cache = await cacheStorage.open(selectedCacheName)
      const response = await cache.match(cacheRequestUrl)
      if (!response) {
        return undefined
      }
      return response.json() as Promise<T>
    },
    async write<T>(
      requestUrl: string,
      credentials: gpt-voiceCredentials,
      value: T,
    ): Promise<void> {
      const cacheRequestUrl = await creategpt-voiceApiCacheRequestUrl(
        requestUrl,
        credentials,
      )
      if (!cacheRequestUrl) {
        return
      }
      const cache = await cacheStorage.open(selectedCacheName)
      await cache.put(cacheRequestUrl, Response.json(value))
    },
  }
}

export const createMemorygpt-voiceApiCache = (): Memorygpt-voiceApiCache => {
  const values = new Map<string, unknown>()
  return {
    async delete(
      requestUrl: string,
      credentials: gpt-voiceCredentials,
    ): Promise<void> {
      const cacheRequestUrl = await creategpt-voiceApiCacheRequestUrl(
        requestUrl,
        credentials,
      )
      if (cacheRequestUrl) {
        values.delete(cacheRequestUrl)
      }
    },
    keys(): readonly string[] {
      return values.keys().toArray()
    },
    async read<T>(
      requestUrl: string,
      credentials: gpt-voiceCredentials,
    ): Promise<T | undefined> {
      const cacheRequestUrl = await creategpt-voiceApiCacheRequestUrl(
        requestUrl,
        credentials,
      )
      if (!cacheRequestUrl || !values.has(cacheRequestUrl)) {
        return undefined
      }
      return values.get(cacheRequestUrl) as T
    },
    async write<T>(
      requestUrl: string,
      credentials: gpt-voiceCredentials,
      value: T,
    ): Promise<void> {
      const cacheRequestUrl = await creategpt-voiceApiCacheRequestUrl(
        requestUrl,
        credentials,
      )
      if (cacheRequestUrl) {
        values.set(cacheRequestUrl, value)
      }
    },
  }
}
