import { expect, test } from '@jest/globals'
import type { gpt-voiceCredentials } from '../src/parts/gpt-voiceTypes/gpt-voiceTypes.ts'
import { getCredentialFingerprint } from '../src/parts/gpt-voiceApiCache/gpt-voiceApiCache.ts'
import {
  creategpt-voiceImageCache,
  testgpt-voiceImageCacheName,
} from '../src/parts/gpt-voiceImageCache/gpt-voiceImageCache.ts'

const imageUrl = 'https://example.com/card-cover.png'
const credentials: gpt-voiceCredentials = {
  apiKey: 'api-key',
  token: 'token',
}

const getImageCacheUrl = async (
  url: string,
  selectedCredentials = credentials,
): Promise<string> => {
  const fingerprint = await getCredentialFingerprint(selectedCredentials)
  const cacheUrl = new URL(url)
  cacheUrl.searchParams.set('gpt-voiceCredential', fingerprint || '')
  cacheUrl.searchParams.sort()
  return cacheUrl.href
}

const createPngResponse = (value: string): Response => {
  return new Response(value, {
    headers: {
      'content-type': 'image/png',
    },
    status: 200,
  })
}

const createMemoryCacheStorage = (
  initialValues: Readonly<Record<string, Response>> = {},
): {
  readonly cacheStorage: CacheStorage
  readonly putUrls: readonly string[]
} => {
  const values = new Map<string, Response>(Object.entries(initialValues))
  const putUrls: string[] = []
  const cache = {
    async match(url: string): Promise<Response | undefined> {
      return values.get(url)?.clone()
    },
    async put(url: string, response: Response): Promise<void> {
      putUrls.push(url)
      values.set(url, response.clone())
    },
  } as unknown as Cache
  const cacheStorage = {
    async open(cacheName: string): Promise<Cache> {
      expect(cacheName).toBe(testgpt-voiceImageCacheName)
      return cache
    },
  } as unknown as CacheStorage
  return { cacheStorage, putUrls }
}

test('resolveImageUrl fetches, caches, and returns object url on cache miss', async () => {
  const { cacheStorage, putUrls } = createMemoryCacheStorage()
  const fetchUrls: string[] = []
  const imageCache = creategpt-voiceImageCache(
    cacheStorage,
    async (url): Promise<Response> => {
      fetchUrls.push(url)
      return createPngResponse('fresh image')
    },
    testgpt-voiceImageCacheName,
  )

  const objectUrl = await imageCache.resolveImageUrl(imageUrl, credentials)

  expect(objectUrl.startsWith('blob:')).toBe(true)
  expect(fetchUrls).toEqual([imageUrl])
  expect(putUrls).toEqual([await getImageCacheUrl(imageUrl)])
  imageCache.dispose()
})

test('resolveImageUrl reads account-scoped Cache Storage before fetching', async () => {
  const cacheUrl = await getImageCacheUrl(imageUrl)
  const { cacheStorage, putUrls } = createMemoryCacheStorage({
    [cacheUrl]: createPngResponse('cached image'),
  })
  const imageCache = creategpt-voiceImageCache(
    cacheStorage,
    async (): Promise<Response> => {
      throw new Error('Expected cached image to be used')
    },
    testgpt-voiceImageCacheName,
  )

  const objectUrl = await imageCache.resolveImageUrl(imageUrl, credentials)

  expect(objectUrl.startsWith('blob:')).toBe(true)
  expect(putUrls).toEqual([])
  imageCache.dispose()
})

test('resolveImageUrl fails closed for non-ok image responses', async () => {
  const { cacheStorage, putUrls } = createMemoryCacheStorage()
  const imageCache = creategpt-voiceImageCache(
    cacheStorage,
    async (): Promise<Response> => {
      return new Response('not found', {
        status: 404,
      })
    },
    testgpt-voiceImageCacheName,
  )

  await expect(imageCache.resolveImageUrl(imageUrl, credentials)).resolves.toBe(
    '',
  )
  expect(putUrls).toEqual([])
  imageCache.dispose()
})

test('resolveImageUrl authenticates gpt-voice download URLs', async () => {
  const { cacheStorage } = createMemoryCacheStorage()
  const requests: Array<
    readonly [
      string,
      (
        | Readonly<{ readonly headers: Readonly<Record<string, string>> }>
        | undefined
      ),
    ]
  > = []
  const gpt-voiceUrl =
    'https://gpt-voice.com/1/cards/card-1/attachments/attachment-1/download/image.png'
  const imageCache = creategpt-voiceImageCache(
    cacheStorage,
    async (url, init): Promise<Response> => {
      requests.push([url, init])
      return createPngResponse('private image')
    },
    testgpt-voiceImageCacheName,
  )

  await imageCache.resolveImageUrl(gpt-voiceUrl, credentials)

  expect(requests).toEqual([
    [
      'https://api.gpt-voice.com/1/cards/card-1/attachments/attachment-1/download/image.png',
      {
        headers: {
          Authorization:
            'OAuth oauth_consumer_key="api-key", oauth_token="token"',
        },
      },
    ],
  ])
  imageCache.dispose()
})

test('resolveImageUrl does not send gpt-voice credentials to external hosts', async () => {
  const { cacheStorage } = createMemoryCacheStorage()
  const requests: Array<
    readonly [
      string,
      (
        | Readonly<{ readonly headers: Readonly<Record<string, string>> }>
        | undefined
      ),
    ]
  > = []
  const imageCache = creategpt-voiceImageCache(
    cacheStorage,
    async (url, init): Promise<Response> => {
      requests.push([url, init])
      return createPngResponse('external image')
    },
    testgpt-voiceImageCacheName,
  )

  await imageCache.resolveImageUrl(imageUrl, credentials)

  expect(requests).toEqual([[imageUrl, undefined]])
  imageCache.dispose()
})

test('resolveImageUrl isolates cached images by gpt-voice account', async () => {
  const { cacheStorage, putUrls } = createMemoryCacheStorage()
  const fetchUrls: string[] = []
  const imageCache = creategpt-voiceImageCache(
    cacheStorage,
    async (url): Promise<Response> => {
      fetchUrls.push(url)
      return createPngResponse('image')
    },
    testgpt-voiceImageCacheName,
  )
  const otherCredentials = { ...credentials, token: 'other-token' }

  await imageCache.resolveImageUrl(imageUrl, credentials)
  await imageCache.resolveImageUrl(imageUrl, otherCredentials)

  expect(fetchUrls).toEqual([imageUrl, imageUrl])
  expect(putUrls).toEqual([
    await getImageCacheUrl(imageUrl, credentials),
    await getImageCacheUrl(imageUrl, otherCredentials),
  ])
  imageCache.dispose()
})
