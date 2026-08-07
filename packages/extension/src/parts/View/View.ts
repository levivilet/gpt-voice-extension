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
  commands: {
    async 'GptVoice.handleClickStart'(context) {
      await context.handleClickStart()
      return context
    },
    async 'GptVoice.setIsTest'(context) {
      context.setIsTest()
      return context
    },
    async 'GptVoice.stop'(context) {
      await context.stop()
      return context
    },
    async 'GptVoice.setTranscript'(context, value: string) {
      context.setTranscript(value)
      return context
    },
  },
  create: createInstance,
  displayName: 'Gpt Voice',
  eventListeners: renderEventListeners(),
  icon: 'list-tree',

  id: 'gpt-voice.views.default',

  kind: 'virtualDom',
  title: 'Gpt Voice',
}
