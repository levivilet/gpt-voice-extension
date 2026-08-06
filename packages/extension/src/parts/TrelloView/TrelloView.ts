import type { View } from '@lvce-editor/api'
import { viewId } from '../Constants/Constants.ts'
import {
  type Activegpt-voiceViewInstance,
  createInstance,
} from '../CreateInstance/CreateInstance.ts'
import { renderEventListeners } from '../RenderEventListeners/RenderEventListeners.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

type gpt-voiceView = Omit<View<Activegpt-voiceViewInstance>, 'commands'> & {
  readonly commands: NonNullable<View<Activegpt-voiceViewInstance>['commands']>
  readonly eventListeners?: ReturnType<typeof renderEventListeners>
}

const runViewAction =
  (action: (instance: Activegpt-voiceViewInstance) => Promise<void>) =>
  async (
    instance: Activegpt-voiceViewInstance,
  ): Promise<Activegpt-voiceViewInstance> => {
    await action(instance)
    return instance
  }

export const view: gpt-voiceView = {
  commands: {
    'gpt-voice.backToBoards': runViewAction((instance) => instance.backToBoards()),
    'gpt-voice.logout': runViewAction((instance) => instance.logout()),
    'gpt-voice.refreshBoards': runViewAction((instance) =>
      instance.refreshBoards(),
    ),
  },
  create: createInstance,
  // @ts-ignore
  displayName: gpt-voiceStrings.gpt-voice(),
  eventListeners: renderEventListeners(),
  icon: 'list-tree',
  id: viewId,
  kind: 'virtualDom',
  preferredLocation: 'preview',
  title: gpt-voiceStrings.gpt-voice(),
}

export {
  readCardDetailPopupEnabledPreference,
  resetgpt-voiceViewDependencyFactory,
  setgpt-voiceViewDependencyFactory,
} from '../DependencyFactory/DependencyFactory.ts'
export {
  backToBoardsActivegpt-voiceViewInstance,
  cancelNewCardActivegpt-voiceViewInstance,
  closeBoardFilterActivegpt-voiceViewInstance,
  closeCardDetailActivegpt-voiceViewInstance,
  logoutActivegpt-voiceViewInstance,
  openCardActivegpt-voiceViewInstance,
  refreshBoardsActivegpt-voiceViewInstance,
  reloadActivegpt-voiceViewInstances,
  saveCardDetailActivegpt-voiceViewInstance,
  startAddCardActivegpt-voiceViewInstance,
  submitNewCardActivegpt-voiceViewInstance,
  addList,
  addCard,
  openMockBoard,
} from '../CreateInstance/CreateInstance.ts'
export { getMenuEntries } from '../MenuEntries/MenuEntries.ts'
export { renderActionsDom } from '../RenderActionsDom/RenderActionsDom.ts'
export {
  boardBackgroundEnabledPreference,
  cardDetailPopupEnabledPreference,
  searchEnabledPreference,
  viewId,
} from '../Constants/Constants.ts'
