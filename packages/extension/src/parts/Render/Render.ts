import {
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import { renderAudio } from '../RenderAudio/RenderAudio.ts'
import { renderButton } from '../RenderButton/RenderButton.ts'
import { renderModelSettings } from '../RenderModelSettings/RenderModelSettings.ts'
import { renderStage } from '../RenderStage/RenderStage.ts'
import { renderStatus } from '../RenderStatus/RenderStatus.ts'
import { renderTranscript } from '../RenderTranscript/RenderTranscript.ts'

export const render = (state: any): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 6,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    ...renderModelSettings(state),
    ...renderStage(state),
    ...renderStatus(state),
    ...renderButton(state),
    ...renderTranscript(state),
    ...renderAudio(state),
  ]
}
