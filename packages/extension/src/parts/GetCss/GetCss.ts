import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getBoardBackgroundCss } from '../BoardBackground/BoardBackground.ts'

const getCardDetailCss = (state: Readonly<gpt-voiceViewState>): string => {
  return `.gpt-voiceCardDetailPanel {
  --gpt-voiceCardDetailWidth: ${state.cardDetailWidth}px;
}`
}

export const getCss = (state: Readonly<gpt-voiceViewState>): string => {
  const boardBackgroundCss = state.boardDetail
    ? getBoardBackgroundCss(
        state.boardDetail.board,
        state.boardBackgroundEnabled,
      )
    : ''
  return [getCardDetailCss(state), boardBackgroundCss]
    .filter(Boolean)
    .join('\n\n')
}
