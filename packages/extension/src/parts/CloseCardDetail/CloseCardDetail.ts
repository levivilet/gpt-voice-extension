import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const closeCardDetail = (context: gpt-voiceViewActionContext): void => {
  const { requestRerender } = context
  const state = context.state as gpt-voiceViewState
  state.selectedCardDetail = undefined
  state.cardAttachmentDropActive = false
  state.cardAttachmentsLoading = false
  state.cardAttachmentsUploading = false
  state.cardCommentsLoading = false
  state.cardDetailLoading = false
  state.cardDetailLoadingCardId = ''
  state.addingCardLabelId = ''
  state.cardLabelCreateOpen = false
  state.cardLabelPickerOpen = false
  state.draftCardDescription = ''
  state.draftCardTitle = ''
  state.draftComment = ''
  state.draftLabelSearchQuery = ''
  state.draftNewLabelColor = 'green'
  state.draftNewLabelName = ''
  state.editingCardDescription = false
  state.editingCardTitle = false
  state.failedCardAttachmentImageIds = []
  state.savingComment = false
  state.savingNewLabel = false
  state.writingComment = false
  state.error = ''
  requestRerender()
}
