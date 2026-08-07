import type { IState } from '../src/parts/CreateInstance/CreateInstance.ts'
import { RealtimeModelPreset } from '../src/parts/WebRtc/WebRtc.ts'

export const createRenderState = (state: Partial<IState> = {}): IState => {
  return {
    animationEnabled: false,
    animationFrame: -1,
    animationScale: 1,
    inProgress: false,
    isTest: false,
    parsedData: [],
    serverId: 'server-id',
    sessionModel: RealtimeModelPreset.Mini,
    transcripts: [],
    uid: 1,
    ...state,
  }
}
