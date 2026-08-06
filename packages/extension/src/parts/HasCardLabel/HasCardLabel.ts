import type { gpt-voiceLabel } from '../gpt-voiceTypes/gpt-voiceTypes.ts'

export const hasCardLabel = (
  labels: readonly gpt-voiceLabel[] | undefined,
  labelId: string,
): boolean => {
  return Boolean(
    labels?.some((label) => {
      return label.id === labelId
    }),
  )
}
