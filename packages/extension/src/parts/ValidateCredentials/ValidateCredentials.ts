import type { gpt-voiceCredentials } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const apiKeyPattern = /^[A-Za-z0-9]{32}$/

export const validateCredentials = (
  credentials: Readonly<gpt-voiceCredentials>,
): string => {
  if (!credentials.apiKey.trim() || !credentials.token.trim()) {
    return gpt-voiceStrings.apiKeyAndTokenRequired()
  }
  if (!apiKeyPattern.test(credentials.apiKey)) {
    return gpt-voiceStrings.apiKeyInvalid()
  }
  return ''
}
