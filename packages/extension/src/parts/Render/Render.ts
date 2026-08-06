import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'

export const render = (): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 4,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    {
      type: VirtualDomElements.Div,
      className: 'GptVoiceStage',
      childCount: 1,
    },
    {
      type: VirtualDomElements.Div,
      className: 'GptVoiceBubble',
      childCount: 0,
    },
    {
      type: VirtualDomElements.Div,
      className: 'GptVoiceStatus',
      childCount: 1,
    },
    text('idle'),
    {
      type: VirtualDomElements.Button,
      className: 'GptVoiceButton',
      id: 'toggle',
      childCount: 1,
      onClick: 'handleClickStart',
    },
    text('Start talking'),
    {
      type: VirtualDomElements.Div,
      childCount: 0,
      className: 'GptVoiceTranscript',
    },
  ]
}
