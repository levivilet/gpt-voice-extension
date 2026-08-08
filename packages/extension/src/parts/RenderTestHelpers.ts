import type { IState } from './CreateInstance/CreateInstance.ts'
import { RealtimeModelPreset } from './WebRtc/WebRtc.ts'

export const createRenderState = (state: Partial<IState> = {}): IState => {
  return {
    animationEnabled: false,
    animationFrame: -1,
    animationScale: 1,
    apiKeyError: '',
    apiKeyInput: '',
    hasOpenAiApiKey: true,
    inProgress: false,
    isCreatingToken: false,
    isSavingApiKey: false,
    isTest: false,
    parsedData: [],
    sessionModel: RealtimeModelPreset.Mini,
    tokenError: '',
    transcribedText: '',
    transcripts: [],
    uid: 1,
    ...state,
  }
}
