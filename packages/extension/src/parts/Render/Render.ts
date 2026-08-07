import {
  text,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState } from '../CreateInstance/CreateInstance.ts'
import { renderAudio } from '../RenderAudio/RenderAudio.ts'
import { renderButton } from '../RenderButton/RenderButton.ts'
import { renderModelSettings } from '../RenderModelSettings/RenderModelSettings.ts'
import { renderStage } from '../RenderStage/RenderStage.ts'
import { renderStatus } from '../RenderStatus/RenderStatus.ts'
import { renderTranscript } from '../RenderTranscript/RenderTranscript.ts'

const renderWelcome = (state: {
  readonly apiKeyError: string
  readonly apiKeyInput: string
  readonly isSavingApiKey: boolean
  readonly tokenError: string
}): readonly VirtualDomNode[] => {
  const statusText = state.apiKeyError || state.tokenError
  return [
    {
      childCount: 6,
      className: 'GptVoiceWelcome',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceWelcomeTitle',
      type: VirtualDomElements.Div,
    },
    text('Set up your OpenAI API key'),
    {
      childCount: 0,
      className: 'GptVoiceWelcomeDescription',
      type: VirtualDomElements.Div,
    },
    text(
      'Your key is stored in extension secret storage. Press Save to continue.',
    ),
    {
      childCount: 0,
      className: 'GptVoiceApiKeyInput',
      disabled: state.isSavingApiKey,
      inputType: 'password',
      name: 'openAiApiKey',
      onInput: 'handleOpenAiApiKeyInput',
      placeholder: 'sk-...',
      type: VirtualDomElements.Input,
      value: state.apiKeyInput,
    },
    {
      childCount: 1,
      className: 'GptVoiceButton',
      disabled: state.isSavingApiKey,
      onClick: 'handleSaveOpenAiApiKey',
      type: VirtualDomElements.Button,
    },
    text(state.isSavingApiKey ? 'Saving...' : 'Save API key'),
    {
      childCount: 0,
      className: 'GptVoiceStatus',
      type: VirtualDomElements.Div,
    },
    text(
      statusText || 'OpenAI API key required to start a live voice session.',
    ),
  ]
}

export const render = (state: IState): readonly VirtualDomNode[] => {
  if (!state.hasOpenAiApiKey) {
    return [
      {
        childCount: 1,
        className: 'GptVoice',
        type: VirtualDomElements.Div,
      },
      ...renderWelcome(state),
    ]
  }

  return [
    {
      childCount: 7,
      className: 'GptVoice',
      type: VirtualDomElements.Div,
    },
    ...renderModelSettings(state),
    ...renderStage(state),
    ...renderStatus(state),
    {
      childCount: 1,
      className: 'GptVoiceApiKeyActions',
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'GptVoiceApiKeyClearButton',
      disabled: state.inProgress,
      onClick: 'handleClearOpenAiApiKey',
      type: VirtualDomElements.Button,
    },
    text('Change API key'),
    ...renderButton(state),
    ...renderTranscript(state),
    ...renderAudio(state),
  ]
}
