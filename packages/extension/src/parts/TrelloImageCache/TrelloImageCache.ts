import type { gpt-voiceCredentials } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { getCredentialFingerprint } from '../gpt-voiceApiCache/gpt-voiceApiCache.ts'

export interface gpt-voiceImageCache {
  readonly dispose: () => void
  readonly resolveImageUrl: (
    url: string,
    credentials: gpt-voiceCredentials,
  ) => Promise<string>
}

export const gpt-voiceImageCacheName = 'builtin.gpt-voice.images'
export const testgpt-voiceImageCacheName = 'test.builtin.gpt-voice.images'

interface ImageRequestInit {
  readonly headers: Readonly<Record<string, string>>
}

type FetchImage = (input: string, init?: ImageRequestInit) => Promise<Response>

const credentialFingerprintSearchParam = 'gpt-voiceCredential'
const gpt-voiceDownloadPathPattern =
  /^\/1\/cards\/[^/]+\/attachments\/[^/]+\/download\//

const isgpt-voiceDownloadUrl = (
  url: Readonly<Pick<URL, 'hostname' | 'pathname'>>,
): boolean => {
  return (
    (url.hostname === 'gpt-voice.com' || url.hostname === 'api.gpt-voice.com') &&
    gpt-voiceDownloadPathPattern.test(url.pathname)
  )
}

const createImageRequest = (
  sourceUrl: string,
  credentials: gpt-voiceCredentials,
): readonly [string, ImageRequestInit | undefined] => {
  const url = new URL(sourceUrl)
  if (!isgpt-voiceDownloadUrl(url)) {
    return [sourceUrl, undefined]
  }
  url.protocol = 'https:'
  url.hostname = 'api.gpt-voice.com'
  url.port = ''
  return [
    url.href,
    {
      headers: {
        Authorization: `OAuth oauth_consumer_key="${credentials.apiKey}", oauth_token="${credentials.token}"`,
      },
    },
  ]
}

const createImageCacheUrl = async (
  sourceUrl: string,
  credentials: gpt-voiceCredentials,
): Promise<string | undefined> => {
  const credentialFingerprint = await getCredentialFingerprint(credentials)
  if (!credentialFingerprint) {
    return undefined
  }
  const url = new URL(sourceUrl)
  url.searchParams.set(credentialFingerprintSearchParam, credentialFingerprint)
  url.searchParams.sort()
  return url.href
}

const createObjectUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob)
}

const revokeObjectUrl = (url: string): void => {
  URL.revokeObjectURL(url)
}

const getCachedResponse = async (
  cache: Readonly<Cache> | undefined,
  url: string,
): Promise<Response | undefined> => {
  if (!cache) {
    return undefined
  }
  return cache.match(url)
}

const writeCachedResponse = async (
  cache: Readonly<Cache> | undefined,
  url: string,
  response: Response,
): Promise<void> => {
  if (!cache) {
    return
  }
  try {
    await cache.put(url, response.clone())
  } catch {
    // Image caching is best-effort; rendering can still use this response.
  }
}

export const creategpt-voiceImageCache = (
  cacheStorage: Readonly<CacheStorage> | undefined = globalThis.caches,
  fetchImage: FetchImage = fetch,
  selectedCacheName = gpt-voiceImageCacheName,
): gpt-voiceImageCache => {
  const objectUrls = new Map<string, string>()
  const pendingObjectUrls = new Map<string, Promise<string>>()

  const openCache = async (): Promise<Cache | undefined> => {
    if (!cacheStorage) {
      return undefined
    }
    return cacheStorage.open(selectedCacheName)
  }

  return {
    dispose(): void {
      for (const objectUrl of objectUrls.values()) {
        revokeObjectUrl(objectUrl)
      }
      objectUrls.clear()
      pendingObjectUrls.clear()
    },
    async resolveImageUrl(
      url: string,
      credentials: gpt-voiceCredentials,
    ): Promise<string> {
      const cacheUrl = await createImageCacheUrl(url, credentials)
      if (!cacheUrl) {
        return ''
      }
      const existing = objectUrls.get(cacheUrl)
      if (existing) {
        return existing
      }
      const pending = pendingObjectUrls.get(cacheUrl)
      if (pending) {
        return pending
      }
      const pendingObjectUrl = (async (): Promise<string> => {
        const cache = await openCache()
        const cachedResponse = await getCachedResponse(cache, cacheUrl)
        const [requestUrl, requestInit] = createImageRequest(url, credentials)
        const response =
          cachedResponse || (await fetchImage(requestUrl, requestInit))
        if (!response.ok) {
          return ''
        }
        if (!cachedResponse) {
          await writeCachedResponse(cache, cacheUrl, response)
        }
        const blob = await response.blob()
        const objectUrl = createObjectUrl(blob)
        objectUrls.set(cacheUrl, objectUrl)
        return objectUrl
      })()
      pendingObjectUrls.set(cacheUrl, pendingObjectUrl)
      try {
        return await pendingObjectUrl
      } finally {
        pendingObjectUrls.delete(cacheUrl)
      }
    },
  }
}
