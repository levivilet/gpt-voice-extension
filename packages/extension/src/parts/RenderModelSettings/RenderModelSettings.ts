import { RealtimeModelPreset } from '../WebRtc/WebRtc.ts'
import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'

export const renderModelSettings = (
  state: { sessionModel: RealtimeModelPreset },
): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 3,
      className: 'GptVoiceModelSettings',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 0,
      className: 'GptVoiceModelSettingsLabel',
      type: VirtualDomElements.Div,
    },
    text(
      state.sessionModel === RealtimeModelPreset.Mini
        ? 'Model: Realtime 2.1 mini (cheaper)'
        : 'Model: Realtime 2.1 (better quality)',
    ),
    {
      childCount: 1,
      className:
        state.sessionModel === RealtimeModelPreset.Mini
          ? 'GptVoiceModelButton active'
          : 'GptVoiceModelButton',
      onClick: 'setRealtimeModelMini',
      type: VirtualDomElements.Button,
    },
    text('Use cheap'),
    {
      childCount: 1,
      className:
        state.sessionModel === RealtimeModelPreset.Standard
          ? 'GptVoiceModelButton active'
          : 'GptVoiceModelButton',
      onClick: 'setRealtimeModelStandard',
      type: VirtualDomElements.Button,
    },
    text('Use better'),
  ]
}
