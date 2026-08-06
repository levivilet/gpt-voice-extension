import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import { updateBoardDetailCard } from '../UpdateBoardDetailCard/UpdateBoardDetailCard.ts'

const hasLabel = (
  labels: readonly gpt-voiceLabel[] | undefined,
  labelId: string,
): boolean => {
  return Boolean(
    labels?.some((label) => {
      return label.id === labelId
    }),
  )
}

const mergeLabels = (
  currentLabels: readonly gpt-voiceLabel[] | undefined,
  updatedLabels: readonly gpt-voiceLabel[] | undefined,
  addedLabel: gpt-voiceLabel,
): readonly gpt-voiceLabel[] => {
  if (updatedLabels) {
    return updatedLabels
  }
  if (hasLabel(currentLabels, addedLabel.id)) {
    return currentLabels || []
  }
  return [...(currentLabels || []), addedLabel]
}

export const openCardLabelPicker = async (
  context: gpt-voiceViewActionContext,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (!state.credentials || !state.boardDetail || !state.selectedCardDetail) {
    return
  }
  state.cardLabelPickerOpen = true
  state.focusedName = 'cardLabelSearch'
  state.error = ''
  if (state.boardLabelsLoaded || state.boardLabelsLoading) {
    requestRerender()
    return
  }
  state.boardLabelsLoading = true
  requestRerender()
  try {
    state.boardLabels = await client.listBoardLabels(
      state.boardDetail.board,
      state.credentials,
    )
    state.boardLabelsLoaded = true
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.boardLabelsLoading = false
  }
  requestRerender()
}

export const closeCardLabelPicker = (
  context: Readonly<gpt-voiceViewActionContext>,
): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.cardLabelCreateOpen = false
  state.cardLabelPickerOpen = false
  state.draftLabelSearchQuery = ''
  state.draftNewLabelColor = 'green'
  state.draftNewLabelName = ''
  state.savingNewLabel = false
  if (
    state.focusedName === 'cardLabelSearch' ||
    state.focusedName === 'newLabelName'
  ) {
    state.focusedName = ''
  }
  requestRerender()
}

export const addCardLabel = async (
  context: gpt-voiceViewActionContext,
  labelId: string,
): Promise<void> => {
  const { client, requestRerender } = context
  const state = context.state as gpt-voiceViewState
  if (
    !state.credentials ||
    !state.selectedCardDetail ||
    state.addingCardLabelId
  ) {
    return
  }
  const label = state.boardLabels.find((item) => {
    return item.id === labelId
  })
  if (!label) {
    return
  }
  const { card } = state.selectedCardDetail
  if (hasLabel(card.labels, label.id)) {
    requestRerender()
    return
  }
  state.addingCardLabelId = label.id
  state.error = ''
  requestRerender()
  try {
    const updatedCard = await client.addCardLabel(
      card,
      label,
      state.credentials,
    )
    const labels = mergeLabels(card.labels, updatedCard.labels, label)
    const mergedCard = {
      ...card,
      ...updatedCard,
      labels,
    }
    state.selectedCardDetail = {
      ...state.selectedCardDetail,
      card: mergedCard,
    }
    updateBoardDetailCard(state, mergedCard)
    state.cardLabelPickerOpen = true
  } catch (error) {
    state.error = getErrorMessage(error)
  } finally {
    state.addingCardLabelId = ''
  }
  requestRerender()
}
