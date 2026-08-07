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
    async 'GptVoice.addTranscript'(context, id: string, value: string) {
      context.addTranscript(id, value, 'ai')
      return context
    },
    async 'GptVoice.handleClickStart'(context) {
      await context.handleClickStart()
      return context
    },
    async 'GptVoice.setAnimation'(context, enabled: boolean, scale: number) {
      context.setAnimation(enabled, scale)
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
  },
  create: createInstance,
  displayName: 'Gpt Voice',
  eventListeners: renderEventListeners(),
  icon: 'list-tree',

  id: 'gpt-voice.views.default',

  kind: 'virtualDom',
  title: 'Gpt Voice',
}
