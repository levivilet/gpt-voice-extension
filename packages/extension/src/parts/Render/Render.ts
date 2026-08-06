import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'

interface State {
  readonly inProgress: boolean
}

const renderButton = (state: State): readonly VirtualDomNode[] => {
  if (state.inProgress) {
    return [
      {
        childCount: 1,
        className: 'GptVoiceButton',
        id: 'toggle',
        onClick: 'handleClickStart',
        type: VirtualDomElements.Button,
      },
      text('Stop talking'),
    ]
  }
  return [
    {
      childCount: 1,
      className: 'GptVoiceButton',
      id: 'toggle',
      onClick: 'handleClickStart',
      type: VirtualDomElements.Button,
    },
    text('Start talking'),
  ]
}

const renderStatus = (state: State): readonly VirtualDomNode[] => {
  if (state.inProgress) {
    return [
      {
        childCount: 1,
        className: 'GptVoiceStatus',
        type: VirtualDomElements.Div,
      },
      text('In Progress'),
    ]
  }
  return [
    {
      childCount: 1,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text('idle'),
  ]
}

const getBubbleClassName = (inProgress: boolean): string => {
  if (inProgress) {
    return 'GptVoiceBubble listening'
  }
  return 'GptVoiceBubble'
}
const renderStage = (state: State): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'GptVoiceStage',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: getBubbleClassName(state.inProgress),
      type: VirtualDomElements.Div,
    },
  ]
}

const renderTranscript = (state: State): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 0,
      className: 'GptVoiceTranscript',
      type: VirtualDomElements.Div,
    },
  ]
}
const renderAudio = (state: State): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 0,
      className: 'GptVoiceAudio',
      type: VirtualDomElements.Audio,
    },
  ]
}

export const render = (state: any): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 5,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    ...renderStage(state),
    ...renderStatus(state),
    ...renderButton(state),
    ...renderTranscript(state),
    ...renderAudio(state),
  ]
}
