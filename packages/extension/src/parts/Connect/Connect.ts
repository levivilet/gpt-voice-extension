import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import { clearBoardSpecificState } from '../ClearBoardSpecificState/ClearBoardSpecificState.ts'
import { getErrorMessage } from '../GetErrorMessage/GetErrorMessage.ts'
import { validateCredentials } from '../ValidateCredentials/ValidateCredentials.ts'

export const connect = async (
  context: gpt-voiceViewActionContext,
): Promise<void> => {
  const { client, requestRerender, storage } = context
  const state = context.state as gpt-voiceViewState
  const credentials = {
    apiKey: state.draftApiKey.trim(),
    token: state.draftToken.trim(),
  }
  state.draftApiKey = credentials.apiKey
  state.draftToken = credentials.token
  const validationError = validateCredentials(credentials)
  if (validationError) {
    state.error = validationError
    requestRerender()
    return
  }
  state.loading = true
  state.error = ''
  requestRerender()
  try {
    const boards = await client.listBoards(credentials)
    await storage.write(credentials)
    state.credentials = credentials
    state.boards = boards
    clearBoardSpecificState(state)
    state.activeSearchQuery = ''
    state.searchResults = []
  } catch (error) {
    state.credentials = undefined
    state.boards = []
    clearBoardSpecificState(state)
    state.activeSearchQuery = ''
    state.searchResults = []
    state.error = getErrorMessage(error)
  } finally {
    state.loading = false
  }
  requestRerender()
}
