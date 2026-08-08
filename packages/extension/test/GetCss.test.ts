import { expect, test } from '@jest/globals'
import { getCss } from '../src/parts/GetCss/GetCss.ts'

test('getCss - returns the animation scale', () => {
  expect(getCss({ animationScale: 1.5 })).toBe(`.GptVoice {
--GptVoiceBubbleTransform: scale(1.5);
}`)
})
