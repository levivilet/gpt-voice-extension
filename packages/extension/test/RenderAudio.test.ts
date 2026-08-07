import { test, expect } from '@jest/globals'
import { VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import { createRenderState } from '../src/parts/RenderTestHelpers.ts'
import { renderAudio } from '../src/parts/RenderAudio/RenderAudio.ts'

test('renderAudio - returns single audio node', () => {
  const result = renderAudio(createRenderState())

  expect(result).toEqual([
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ])
})
