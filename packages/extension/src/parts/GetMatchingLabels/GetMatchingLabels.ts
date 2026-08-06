import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { getLabelText } from '../LabelHelpers/LabelHelpers.ts'

export const getMatchingLabels = (
  state: Readonly<gpt-voiceViewState>,
): readonly gpt-voiceLabel[] => {
  const { boardLabels, draftLabelSearchQuery } = state
  const query = draftLabelSearchQuery.trim().toLowerCase()
  return boardLabels.filter((label) => {
    if (!query) {
      return true
    }
    return getLabelText(label).toLowerCase().includes(query)
  })
}
