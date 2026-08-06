import type { gpt-voiceList } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const addListFormName = 'addList'

const appendList = (
  state: Readonly<gpt-voiceViewState>,
  list: gpt-voiceList,
): void => {
  if (!state.boardDetail) {
    return
  }
  const mutableState = state as gpt-voiceViewState
  mutableState.boardDetail = {
    ...state.boardDetail,
    lists: [...state.boardDetail.lists, list],
  }
}

export const startAddList = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.addingList = true
  state.draftNewListTitle = ''
  state.focusedName = 'newListTitle'
  state.savingNewList = false
  state.error = ''
  requestRerender()
}

export const cancelAddList = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.addingList = false
  state.draftNewListTitle = ''
  state.savingNewList = false
  state.error = ''
  requestRerender()
}

export const submitAddList = async (
  context: Readonly<gpt-voiceViewActionContext>,
  formName: string | undefined,
): Promise<boolean> => {
  if (formName !== addListFormName) {
    return false
  }
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || !state.boardDetail || state.savingNewList) {
    return true
  }
  const name = state.draftNewListTitle.trim()
  state.addingList = true
  if (!name) {
    state.error = gpt-voiceStrings.listTitleRequired()
    requestRerender()
    return true
  }
  state.savingNewList = true
  state.error = ''
  requestRerender()
  try {
    const list = await client.createList(
      state.boardDetail.board,
      {
        name,
        pos: 'bottom',
      },
      state.credentials,
    )
    appendList(state, list)
    state.addingList = false
    state.draftNewListTitle = ''
    state.error = ''
  } catch (error) {
    state.error = getErrorMessage(error)
  }
  state.savingNewList = false
  requestRerender()
  return true
}
