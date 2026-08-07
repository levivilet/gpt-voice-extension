import {
  text,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'

export const renderStatus = (state: {
  readonly inProgress: boolean
  readonly isCreatingToken: boolean
  readonly tokenError: string
}): readonly VirtualDomNode[] => {
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
  if (state.isCreatingToken) {
    return [
      {
        childCount: 1,
        className: 'GptVoiceStatus',
        type: VirtualDomElements.Div,
      },
      text('Creating token'),
    ]
  }
  if (state.tokenError) {
    return [
      {
        childCount: 1,
        className: 'GptVoiceStatus',
        type: VirtualDomElements.Div,
      },
      text(state.tokenError),
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
