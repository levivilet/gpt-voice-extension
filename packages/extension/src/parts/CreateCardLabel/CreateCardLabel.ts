import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { addCardLabel } from '../CardLabelPicker/CardLabelPicker.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const openCardLabelCreate = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  const name = state.draftLabelSearchQuery.trim()
  if (!name) {
    return
  }
  state.cardLabelCreateOpen = true
  state.draftNewLabelColor = 'green'
  state.draftNewLabelName = name
  state.focusedName = 'newLabelName'
  requestRerender()
}

export const closeCardLabelCreate = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.cardLabelCreateOpen = false
  state.draftNewLabelColor = 'green'
  state.draftNewLabelName = ''
  state.focusedName = 'cardLabelSearch'
  requestRerender()
}

export const selectCardLabelColor = (
  context: Readonly<gpt-voiceViewActionContext>,
  color: string,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.draftNewLabelColor = color
  requestRerender()
}

export const createCardLabel = async (
  context: gpt-voiceViewActionContext,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  const name = state.draftNewLabelName.trim()
  if (
    !state.credentials ||
    !state.boardDetail ||
    !state.selectedCardDetail ||
    !state.draftNewLabelColor ||
    state.savingNewLabel
  ) {
    return
  }
  if (!name) {
    state.error = gpt-voiceStrings.labelTitleRequired()
    requestRerender()
    return
  }
  state.error = ''
  state.savingNewLabel = true
  requestRerender()
  try {
    const label = await client.createLabel(
      state.boardDetail.board,
      {
        color: state.draftNewLabelColor,
        name,
      },
      state.credentials,
    )
    state.boardLabels = [...state.boardLabels, label]
    state.cardLabelCreateOpen = false
    state.draftLabelSearchQuery = ''
    state.draftNewLabelColor = 'green'
    state.draftNewLabelName = ''
    state.focusedName = 'cardLabelSearch'
    state.savingNewLabel = false
    await addCardLabel(context, label.id)
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.savingNewLabel = false
  }
  requestRerender()
}
