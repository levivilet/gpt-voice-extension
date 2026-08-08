import { beforeEach, expect, jest, test } from '@jest/globals'
import { state as rpcState } from '../src/parts/Rpc/Rpc.ts'
import {
  createSessionConfig,
  defaultSessionConfig,
  getEphemeralKey,
  getSdp,
  RealtimeModelPreset,
} from '../src/parts/WebRtc/WebRtc.ts'

const rpcInvoke = jest.fn<(method: string, ...params: readonly any[]) => any>()

beforeEach(() => {
  jest.restoreAllMocks()
  rpcInvoke.mockReset()
  rpcState.rpcPromise = Promise.resolve({
    invoke: rpcInvoke,
  })
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

test('getEphemeralKey - starts server, fetches token, and stops server', async () => {
  const sessionConfig = createSessionConfig(RealtimeModelPreset.Standard)
  const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => ({ value: 'ephemeral-key' }),
    ok: true,
  } as Response)

  await expect(getEphemeralKey('server-1', sessionConfig)).resolves.toBe(
    'ephemeral-key',
  )
  expect(rpcInvoke).toHaveBeenNthCalledWith(
    1,
    'GptVoice.startServer',
    'server-1',
    3333,
  )
  expect(fetch).toHaveBeenCalledWith('http://localhost:3333/token', {
    body: JSON.stringify(sessionConfig),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
  expect(rpcInvoke).toHaveBeenNthCalledWith(
    2,
    'GptVoice.stopServer',
    'server-1',
  )
})

test('getEphemeralKey - returns empty string when token request fails', async () => {
  const tokenData = { error: 'invalid request' }
  jest.spyOn(globalThis, 'fetch').mockResolvedValue({
    json: async () => tokenData,
    ok: false,
  } as Response)
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => undefined)

  await expect(getEphemeralKey('server-2')).resolves.toBe('')
  expect(consoleError).toHaveBeenNthCalledWith(1, 'failed to fetch token')
  expect(consoleError).toHaveBeenNthCalledWith(2, tokenData)
  expect(rpcInvoke).toHaveBeenCalledTimes(1)
  expect(rpcInvoke).toHaveBeenCalledWith(
    'GptVoice.startServer',
    'server-2',
    3333,
  )
  expect(defaultSessionConfig.session.model).toBe(RealtimeModelPreset.Mini)
})

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
