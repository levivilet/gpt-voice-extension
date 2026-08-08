import { test, expect } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { renderAudio } from '../src/parts/RenderAudio/RenderAudio.ts'

test('renderAudio - returns single audio node', () => {
  const result = renderAudio()

  expect(result).toEqual([
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ])
})
