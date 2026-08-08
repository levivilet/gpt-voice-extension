import { expect, test } from '@jest/globals'
import { invoke } from '../src/parts/Rpc/Rpc.ts'

test('invoke - rejects legacy node rpc requests', async () => {
  await expect(invoke('test.method', 'one')).rejects.toThrow(
    'Legacy Node RPC (test.method) is not supported for gpt-voice',
  )
})
