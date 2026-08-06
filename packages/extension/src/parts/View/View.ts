import type { View } from '@lvce-editor/api'
import {
  type ActiveTrelloViewInstance,
  createInstance,
} from '../CreateInstance/CreateInstance.ts'
import { renderEventListeners } from '../RenderEventListeners/RenderEventListeners.ts'

type TrelloView = Omit<View<ActiveTrelloViewInstance>, 'commands'> & {
  readonly commands: NonNullable<View<ActiveTrelloViewInstance>['commands']>
  readonly eventListeners?: ReturnType<typeof renderEventListeners>
}

export const view: TrelloView = {
  commands: {},
  create: createInstance,
  displayName: 'Gpt Voice',
  eventListeners: renderEventListeners(),
  icon: 'list-tree',
  id: 'gpt-voice',
  kind: 'virtualDom',
  title: 'Gpt Voice',
}
