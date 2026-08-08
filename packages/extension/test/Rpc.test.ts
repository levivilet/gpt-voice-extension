import { beforeEach, expect, jest, test } from '@jest/globals'
import { invoke, state } from '../src/parts/Rpc/Rpc.ts'

const rpcInvoke = jest.fn<(method: string, ...params: readonly any[]) => any>()

beforeEach(() => {
  rpcInvoke.mockReset()
  state.rpcPromise = Promise.resolve({
    invoke: rpcInvoke,
  })
})

test('invoke - reuses existing rpc', async () => {
  rpcInvoke.mockResolvedValue('result')

  await invoke('first')
  await invoke('second')

  expect(rpcInvoke).toHaveBeenNthCalledWith(1, 'first')
  expect(rpcInvoke).toHaveBeenNthCalledWith(2, 'second')
})
