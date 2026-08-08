import {
  text,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { IState } from '../CreateInstance/CreateInstance.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as GptVoiceStrings from '../GptVoiceStrings/GptVoiceStrings.ts'
import { renderAudio } from '../RenderAudio/RenderAudio.ts'
import { renderButton } from '../RenderButton/RenderButton.ts'
import { renderModelSettings } from '../RenderModelSettings/RenderModelSettings.ts'
import { renderStage } from '../RenderStage/RenderStage.ts'
import { renderStatus } from '../RenderStatus/RenderStatus.ts'
import { renderTranscript } from '../RenderTranscript/RenderTranscript.ts'

const welcomeNode: VirtualDomNode = {
  childCount: 6,
  className: ClassNames.GptVoiceWelcome,
  type: VirtualDomElements.Div,
}

const welcomeTitleNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.GptVoiceWelcomeTitle,
  type: VirtualDomElements.Div,
}

const welcomeDescriptionNode: VirtualDomNode = {
  childCount: 0,
  className: ClassNames.GptVoiceWelcomeDescription,
  type: VirtualDomElements.Div,
}

const statusNode: VirtualDomNode = {
  childCount: 0,
  className: ClassNames.GptVoiceStatus,
  type: VirtualDomElements.Div,
}

const welcomeContainerNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.GptVoice,
  type: VirtualDomElements.Div,
}

const voiceContainerNode: VirtualDomNode = {
  childCount: 7,
  className: ClassNames.GptVoice,
  type: VirtualDomElements.Div,
}

const apiKeyActionsNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.GptVoiceApiKeyActions,
  type: VirtualDomElements.Div,
}

const renderWelcome = (state: {
  readonly apiKeyError: string
  readonly apiKeyInput: string
  readonly isSavingApiKey: boolean
  readonly tokenError: string
}): readonly VirtualDomNode[] => {
  const { apiKeyError, apiKeyInput, isSavingApiKey, tokenError } = state
  const statusText = apiKeyError || tokenError
  return [
    welcomeNode,
    welcomeTitleNode,
    text(GptVoiceStrings.setUpOpenAiApiKey()),
    welcomeDescriptionNode,
    text(GptVoiceStrings.welcomeDescription()),
    {
      childCount: 0,
      className: ClassNames.GptVoiceApiKeyInput,
      disabled: isSavingApiKey,
      inputType: 'password',
      name: 'openAiApiKey',
      onInput: DomEventListenerFunctions.HandleOpenAiApiKeyInput,
      placeholder: 'sk-...',
      type: VirtualDomElements.Input,
      value: apiKeyInput,
    },
    {
      childCount: 1,
      className: ClassNames.GptVoiceButton,
      disabled: isSavingApiKey,
      onClick: DomEventListenerFunctions.HandleSaveOpenAiApiKey,
      type: VirtualDomElements.Button,
    },
    text(
      isSavingApiKey ? GptVoiceStrings.saving() : GptVoiceStrings.saveApiKey(),
    ),
    statusNode,
    text(statusText || GptVoiceStrings.openAiApiKeyRequiredForVoice()),
  ]
}

export const render = (state: IState): readonly VirtualDomNode[] => {
  const { hasOpenAiApiKey, inProgress } = state
  if (!hasOpenAiApiKey) {
    return [welcomeContainerNode, ...renderWelcome(state)]
  }

  return [
    voiceContainerNode,
    ...renderModelSettings(state),
    ...renderStage(state),
    ...renderStatus(state),
    apiKeyActionsNode,
    {
      childCount: 1,
      className: ClassNames.GptVoiceApiKeyClearButton,
      disabled: inProgress,
      onClick: DomEventListenerFunctions.HandleClearOpenAiApiKey,
      type: VirtualDomElements.Button,
    },
    text(GptVoiceStrings.changeApiKey()),
    ...renderButton(state),
    ...renderTranscript(state),
    ...renderAudio(),
  ]
}
