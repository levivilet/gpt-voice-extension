import { expect, test } from '@jest/globals'
import {
  createSessionConfig,
  RealtimeModelPreset,
} from '../src/parts/WebRtc/WebRtc.ts'

test('includes registered function tools in the realtime session', () => {
  const tools = [
    {
      description: 'Test tool',
      name: 'test',
      parameters: { type: 'object' },
      type: 'function' as const,
    },
  ]

  const config = createSessionConfig(RealtimeModelPreset.Standard, tools)

  expect(config.session.model).toBe(RealtimeModelPreset.Standard)
  expect(config.session.tools).toBe(tools)
  expect(config.session.instructions).toBe(
    'You are a voice assistant with access to tools.',
  )
})

test('defaults to no tools', () => {
  expect(createSessionConfig(RealtimeModelPreset.Mini).session.tools).toEqual(
    [],
  )
})
