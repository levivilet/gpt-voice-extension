import type { ViewEvent } from '@lvce-editor/api'
import type {
  gpt-voiceViewActionContext,
  gpt-voiceViewState,
} from '../gpt-voiceViewState/gpt-voiceViewState.ts'

const listTitlePrefix = 'listTitle:'

export const handleFocusEvent = (
  context: Readonly<gpt-voiceViewActionContext>,
  event: Readonly<ViewEvent>,
): void => {
  const state = context.state as gpt-voiceViewState
  state.focusedName = event.name || ''
  if (!event.name?.startsWith(listTitlePrefix)) {
    return
  }
  const listId = event.name.slice(listTitlePrefix.length)
  const list = state.boardDetail?.lists.find((item) => {
    return item.id === listId
  })
  if (!list) {
    return
  }
  const title = state.draftListTitles[listId] ?? list.name
  state.pendingSelections = [
    {
      end: title.length,
      name: event.name,
      start: 0,
    },
  ]
}
