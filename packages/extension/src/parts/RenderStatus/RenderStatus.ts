import {
  text,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as GptVoiceStrings from '../GptVoiceStrings/GptVoiceStrings.ts'

const statusNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.GptVoiceStatus,
  type: VirtualDomElements.Div,
}

export const renderStatus = (state: {
  readonly inProgress: boolean
  readonly isCreatingToken: boolean
  readonly tokenError: string
}): readonly VirtualDomNode[] => {
  const { inProgress, isCreatingToken, tokenError } = state
  if (inProgress) {
    return [statusNode, text(GptVoiceStrings.inProgress())]
  }
  if (isCreatingToken) {
    return [statusNode, text(GptVoiceStrings.creatingToken())]
  }
  if (tokenError) {
    return [statusNode, text(tokenError)]
  }
  return [statusNode, text(GptVoiceStrings.idle())]
}
