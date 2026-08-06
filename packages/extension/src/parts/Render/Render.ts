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
        type: VirtualDomElements.Button,
        className: 'GptVoiceButton',
        id: 'toggle',
        childCount: 1,
        onClick: 'handleClickStart',
      },
      text('Stop talking'),
    ]
  }
  return [
    {
      type: VirtualDomElements.Button,
      className: 'GptVoiceButton',
      id: 'toggle',
      childCount: 1,
      onClick: 'handleClickStart',
    },
    text('Start talking'),
  ]
}

const renderStatus = (state: State): readonly VirtualDomNode[] => {
  if (state.inProgress) {
    return [
      {
        type: VirtualDomElements.Div,
        className: 'GptVoiceStatus',
        childCount: 1,
      },
      text('In Progress'),
    ]
  }
  return [
    {
      type: VirtualDomElements.Div,
      className: 'GptVoiceStatus',
      childCount: 1,
    },
    text('idle'),
  ]
}

const renderStage = (state: State): readonly VirtualDomNode[] => {
  return [
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
  ]
}

export const render = (state: any): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 4,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    ...renderStage(state),
    ...renderStatus(state),
    ...renderButton(state),
    {
      type: VirtualDomElements.Div,
      childCount: 0,
      className: 'GptVoiceTranscript',
    },
  ]
}
