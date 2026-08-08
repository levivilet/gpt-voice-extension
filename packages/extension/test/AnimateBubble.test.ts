import { expect, test } from '@jest/globals'
import { animateBubble } from '../src/parts/AnimateBubble/AnimateBubble.ts'

test('animateBubble - enables animation for dominant microphone audio', () => {
  expect(animateBubble(0.2, 0.1)).toEqual({
    enabled: true,
    scale: 1.6400000000000001,
  })
})

test('animateBubble - disables animation for dominant remote audio', () => {
  expect(animateBubble(0.1, 0.2)).toEqual({
    enabled: false,
    scale: 1.6400000000000001,
  })
})

test('animateBubble - disables animation below microphone threshold and caps scale', () => {
  expect(animateBubble(0.03, 0)).toEqual({ enabled: false, scale: 1.096 })
  expect(animateBubble(1, 0)).toEqual({ enabled: true, scale: 1.9 })
})
