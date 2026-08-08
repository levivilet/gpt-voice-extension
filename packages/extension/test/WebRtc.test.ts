import { afterEach, expect, jest, test } from '@jest/globals'
import {
  createSessionConfig,
  getEphemeralKey,
  getSdp,
  RealtimeModelPreset,
} from '../src/parts/WebRtc/WebRtc.ts'

afterEach(() => {
  jest.restoreAllMocks()
})

test('createSessionConfig - includes registered function tools', () => {
  const tools = [
    {
      description: 'Test tool',
      name: 'test',
      parameters: { type: 'object' },
      type: 'function' as const,
    },
  ]

  const config = createSessionConfig(RealtimeModelPreset.Standard, tools)

  expect(config.session.tools).toBe(tools)
  expect(config.session.instructions).toBe(
    'You are a voice assistant with access to tools.',
  )
})

test('createSessionConfig - defaults to no tools', () => {
  expect(createSessionConfig(RealtimeModelPreset.Mini).session.tools).toEqual(
    [],
  )
})

test('createSessionConfig - selects transcription model for each realtime model', () => {
  const mini = createSessionConfig(RealtimeModelPreset.Mini)
  const standard = createSessionConfig(RealtimeModelPreset.Standard)

  expect(mini.session.audio.input.transcription.model).toBe(
    'gpt-4o-mini-transcribe',
  )
  expect(standard.session.audio.input.transcription.model).toBe(
    'gpt-4o-transcribe',
  )
  expect(mini.session.model).toBe(RealtimeModelPreset.Mini)
  expect(standard.session.model).toBe(RealtimeModelPreset.Standard)
})

test('getEphemeralKey - posts session and returns token', async () => {
  const sessionConfig = createSessionConfig(RealtimeModelPreset.Standard)
  const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => ({ value: 'ephemeral-key' }),
    ok: true,
  } as Response)

  await expect(getEphemeralKey('sk-api-key', sessionConfig)).resolves.toBe(
    'ephemeral-key',
  )
  expect(fetch).toHaveBeenCalledWith(
    'https://api.openai.com/v1/realtime/client_secrets',
    {
      body: JSON.stringify(sessionConfig),
      headers: {
        Authorization: 'Bearer sk-api-key',
        'Content-Type': 'application/json',
      },
      method: 'POST',
    },
  )
})

test.each([
  [{ error: { message: 'invalid key' } }, 'invalid key'],
  [{}, 'Failed to create ephemeral token (400)'],
  [{ error: 'invalid' }, 'Failed to create ephemeral token (400)'],
  [{ error: null }, 'Failed to create ephemeral token (400)'],
  [{ error: {} }, 'Failed to create ephemeral token (400)'],
  [{ error: { message: 401 } }, 'Failed to create ephemeral token (400)'],
  // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
])('getEphemeralKey - reports token error %#', async (tokenData, message) => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => tokenData,
    ok: false,
    status: 400,
  } as Response)

  await expect(getEphemeralKey('sk-api-key')).rejects.toThrow(message)
})

test('getEphemeralKey - reports status when error response is not json', async () => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => {
      throw new Error('invalid json')
    },
    ok: false,
    status: 502,
  } as unknown as Response)

  await expect(getEphemeralKey('sk-api-key')).rejects.toThrow(
    'Failed to create ephemeral token (502)',
  )
})

test.each([undefined, '', 1])(
  'getEphemeralKey - rejects invalid token %#',
  async (value) => {
    jest.spyOn(globalThis, 'fetch').mockResolvedValue({
      json: async () => ({ value }),
      ok: true,
    } as Response)

    await expect(getEphemeralKey('sk-api-key')).rejects.toThrow(
      'Invalid ephemeral key response.',
    )
  },
)

test('getSdp - posts offer and returns answer', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    text: async () => 'answer-sdp',
  } as Response)

  await expect(getSdp('offer-sdp', 'ephemeral-key')).resolves.toBe('answer-sdp')
  expect(fetch).toHaveBeenCalledWith(
    'https://api.openai.com/v1/realtime/calls',
    {
      body: 'offer-sdp',
      headers: {
        Authorization: 'Bearer ephemeral-key',
        'Content-Type': 'application/sdp',
      },
      method: 'POST',
    },
  )
})
