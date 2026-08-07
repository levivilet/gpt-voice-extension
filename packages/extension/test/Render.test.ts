import { test, expect } from '@jest/globals'
import {
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { ITranscript } from '../src/parts/CreateInstance/CreateInstance.ts'
import { RealtimeModelPreset } from '../src/parts/WebRtc/WebRtc.ts'
import { render } from '../src/parts/Render/Render.ts'
import { createRenderState } from './RenderTestHelpers.ts'

test('render - returns virtual dom tree for idle mini state', () => {
  const state = createRenderState()
  const result = render(state)

  expect(result).toEqual([
    {
      childCount: 6,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 3,
      className: 'GptVoiceModelSettings',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceModelSettingsLabel',
      type: VirtualDomElements.Div,
    },
    text('Model: Realtime 2.1 mini (cheaper)'),
    {
      childCount: 1,
      className: 'GptVoiceModelButton active',
      onClick: 'setRealtimeModelMini',
      type: VirtualDomElements.Button,
    },
    text('Use cheap'),
    {
      childCount: 1,
      className: 'GptVoiceModelButton',
      onClick: 'setRealtimeModelStandard',
      type: VirtualDomElements.Button,
    },
    text('Use better'),
    {
      childCount: 1,
      className: 'GptVoiceStage',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'GptVoiceBubble',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('idle'),
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: 'handleClickStart',
      type: VirtualDomElements.Button,
    },
    text('Start talking'),
    {
      childCount: 0,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ])
})

test('render - returns in-progress standard state for active conversation', () => {
  const transcript: ITranscript = {
    id: 'id-1',
    text: 'Hello',
    type: 'user',
  }
  const state = createRenderState({
    inProgress: true,
    sessionModel: RealtimeModelPreset.Standard,
    transcripts: [transcript],
  })
  const result = render(state)

  expect(result).toEqual([
    {
      childCount: 6,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 3,
      className: 'GptVoiceModelSettings',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceModelSettingsLabel',
      type: VirtualDomElements.Div,
    },
    text('Model: Realtime 2.1 (better quality)'),
    {
      childCount: 1,
      className: 'GptVoiceModelButton',
      onClick: 'setRealtimeModelMini',
      type: VirtualDomElements.Button,
    },
    text('Use cheap'),
    {
      childCount: 1,
      className: 'GptVoiceModelButton active',
      onClick: 'setRealtimeModelStandard',
      type: VirtualDomElements.Button,
    },
    text('Use better'),
    {
      childCount: 1,
      className: 'GptVoiceStage',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'GptVoiceBubble listening',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('In Progress'),
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: 'handleClickStart',
      type: VirtualDomElements.Button,
    },
    text('Stop talking'),
    {
      childCount: 1,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceTranscriptItem GptVoiceTranscriptItemUser',
      type: VirtualDomElements.Div,
    },
    text('Hello'),
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ])
})
