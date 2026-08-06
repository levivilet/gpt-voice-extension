import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const getTitle = (state: Readonly<gpt-voiceViewState>): string => {
  const { boardDetail } = state
  if (boardDetail) {
    return gpt-voiceStrings.gpt-voiceBoard(boardDetail.board.name)
  }
  return gpt-voiceStrings.gpt-voice()
}
