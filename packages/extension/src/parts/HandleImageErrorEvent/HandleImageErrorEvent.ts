import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'

export const handleImageErrorEvent = (
  context: Readonly<gpt-voiceViewActionContext>,
  attachmentId: string,
): void => {
  const state = context.state as gpt-voiceViewState
  if (
    !attachmentId ||
    state.failedCardAttachmentImageIds.includes(attachmentId)
  ) {
    return
  }
  state.failedCardAttachmentImageIds = [
    ...state.failedCardAttachmentImageIds,
    attachmentId,
  ]
}
