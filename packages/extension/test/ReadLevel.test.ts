import { expect, test } from '@jest/globals'
import { readLevel } from '../src/parts/ReadLevel/ReadLevel.ts'

test('readLevel - returns zero for empty data', () => {
  expect(readLevel(new Uint8Array())).toBe(0)
})

test('readLevel - returns root mean square level', () => {
  expect(readLevel(new Uint8Array([128, 255]))).toBeCloseTo(0.7016, 4)
})
