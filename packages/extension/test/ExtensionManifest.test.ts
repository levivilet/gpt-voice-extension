import { expect, test } from '@jest/globals'
import { readFileSync } from 'node:fs'

const extensionManifest = JSON.parse(
  readFileSync(new URL('../extension.json', import.meta.url), 'utf8'),
)

test('declares the voice function calling web worker', () => {
  expect(extensionManifest.rpc).toContainEqual({
    contentSecurityPolicy: ["default-src 'none'", "script-src 'self'"],
    id: 'builtin.gpt-voice.voice-function-calling-worker',
    name: 'Voice Function Calling Worker',
    type: 'web-worker',
    url: 'dist/voiceFunctionCallingWorkerMain.js',
  })
})
