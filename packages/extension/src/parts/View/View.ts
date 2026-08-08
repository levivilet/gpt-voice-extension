import type { View } from '@lvce-editor/api'
import {
  type ActiveGptVoiceViewInstance,
  createInstance,
} from '../CreateInstance/CreateInstance.ts'
import * as GptVoiceStrings from '../GptVoiceStrings/GptVoiceStrings.ts'
import { renderEventListeners } from '../RenderEventListeners/RenderEventListeners.ts'

type GptVoiceView = Omit<View<ActiveGptVoiceViewInstance>, 'commands'> & {
  readonly commands: NonNullable<View<ActiveGptVoiceViewInstance>['commands']>
  readonly eventListeners?: ReturnType<typeof renderEventListeners>
}

export const view: GptVoiceView = {
  commands: {
    async 'GptVoice.addTranscript'(
      context,
      id: string,
      value: string,
      type: 'user' | 'ai' = 'ai',
    ) {
      context.addTranscript(id, value, type)
      return context
    },
    async 'GptVoice.handleClearOpenAiApiKey'(context) {
      await context.handleClearOpenAiApiKey()
      return context
    },
    async 'GptVoice.handleClickStart'(context) {
      await context.handleClickStart()
      return context
    },
    'GptVoice.handleOpenAiApiKeyInput'(context, value: string) {
      context.handleOpenAiApiKeyInput(value)
      return context
    },
    async 'GptVoice.handleSaveOpenAiApiKey'(context) {
      await context.handleSaveOpenAiApiKey()
      return context
    },
    async 'GptVoice.setAnimation'(context, enabled: boolean, scale: number) {
      context.setAnimation(enabled, scale)
      return context
    },
    async 'GptVoice.setRealtimeModelMini'(context) {
      context.setRealtimeModelMini()
      return context
    },
    async 'GptVoice.setRealtimeModelStandard'(context) {
      context.setRealtimeModelStandard()
      return context
    },
    async 'GptVoice.stop'(context) {
      await context.stop()
      return context
    },
  },
  create: createInstance,
  displayName: GptVoiceStrings.gptVoiceDisplayName(),
  eventListeners: renderEventListeners(),
  icon: 'list-tree',

  id: 'gpt-voice.views.default',

  kind: 'virtualDom',
  title: GptVoiceStrings.gptVoice(),
}
