import type { View } from '@lvce-editor/api'
import {
  type ActiveGptVoiceViewInstance,
  createInstance,
} from '../CreateInstance/CreateInstance.ts'
import { renderEventListeners } from '../RenderEventListeners/RenderEventListeners.ts'

type TrelloView = Omit<View<ActiveGptVoiceViewInstance>, 'commands'> & {
  readonly commands: NonNullable<View<ActiveGptVoiceViewInstance>['commands']>
  readonly eventListeners?: ReturnType<typeof renderEventListeners>
}

export const view: TrelloView = {
  commands: {},
  create: createInstance,
  displayName: 'Gpt Voice',
  eventListeners: renderEventListeners(),
  icon: 'list-tree',

  id: 'gpt-voice.views.default',

  kind: 'virtualDom',
  title: 'Gpt Voice',
}
