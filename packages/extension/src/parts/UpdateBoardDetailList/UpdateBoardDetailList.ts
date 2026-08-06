import type { gpt-voiceList } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const updateBoardDetailList = (
  state: Readonly<gpt-voiceViewState>,
  list: Readonly<gpt-voiceList>,
): void => {
  const mutableState = state as gpt-voiceViewState
  if (!mutableState.boardDetail) {
    return
  }
  mutableState.boardDetail = {
    ...mutableState.boardDetail,
    lists: mutableState.boardDetail.lists.map((item) => {
      return item.id === list.id ? list : item
    }),
  }
}
