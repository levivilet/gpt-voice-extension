import {
  text,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'

export const renderButton = (state: {
  readonly inProgress: boolean
  readonly hasOpenAiApiKey: boolean
  readonly isCreatingToken: boolean
  readonly isSavingApiKey: boolean
}): readonly VirtualDomNode[] => {
  if (!state.hasOpenAiApiKey || state.isCreatingToken || state.isSavingApiKey) {
    let label = 'Start talking'
    if (state.isCreatingToken) {
      label = 'Creating token'
    } else if (state.isSavingApiKey) {
      label = 'Saving key'
    }
    return [
      {
        childCount: 1,
        className: 'GptVoiceButton',
        disabled: true,
        id: 'toggle',
        onClick: 'handleClickStart',
        type: VirtualDomElements.Button,
      },
      text(label),
    ]
  }

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
