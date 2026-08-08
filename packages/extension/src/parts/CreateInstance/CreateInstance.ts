import type {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import * as ExtensionApi from '@lvce-editor/api'
import {
  setRemoteDescription,
  startWebRtcAudioStream,
  stopWebRtcAudioStream,
  readMicLevels,
} from '@lvce-editor/api'
import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { MenuEntry } from '../MenuEntries/MenuEntries.ts'
import { animateBubble } from '../AnimateBubble/AnimateBubble.ts'
import * as ClassNames from '../ClassNames/ClassNames.ts'
import { getCss } from '../GetCss/GetCss.ts'
import { getTitle } from '../GetTitle/GetTitle.ts'
import * as GptVoiceStrings from '../GptVoiceStrings/GptVoiceStrings.ts'
import { createOpenAiApiKeyStorage } from '../OpenAiApiKeyStorage/OpenAiApiKeyStorage.ts'
import { readLevel } from '../ReadLevel/ReadLevel.ts'
import { render } from '../Render/Render.ts'
import { isInTestMode } from '../TestMode/TestMode.ts'
import * as VoiceFunctionCallingWorker from '../VoiceFunctionCallingWorker/VoiceFunctionCallingWorker.ts'
import {
  createSessionConfig,
  defaultSessionModel,
  getEphemeralKey,
  RealtimeModelPreset,
  getSdp,
} from '../WebRtc/WebRtc.ts'

const actionsDomNode: VirtualDomNode = {
  childCount: 1,
  className: ClassNames.Main,
  type: VirtualDomElements.Div,
}

const focusSelector = `.${ClassNames.Main}`

export interface ActiveGptVoiceViewInstance extends VirtualDomViewInstance {
  readonly addTranscript: (
    id: string,
    value: string,
    type: 'user' | 'ai',
  ) => void
  readonly createOrUpdateTranscript: (parsed: any, type: 'user' | 'ai') => void
  readonly doAnimate: () => Promise<void>
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleClearOpenAiApiKey: () => Promise<void>
  readonly handleClickStart: () => Promise<void>
  readonly handleData: (data: string) => void
  readonly handleInputTranscript: (parsed: any) => void
  readonly handleOpenAiApiKeyInput: (value: string) => void
  readonly handleOutputTranscript: (parsed: any) => void
  readonly handleSaveOpenAiApiKey: () => Promise<void>
  readonly renderTitle: () => string
  readonly setAnimation: (enabled: boolean, scale: number) => void
  readonly setRealtimeModelMini: () => void
  readonly setRealtimeModelStandard: () => void
  readonly stop: () => Promise<void>
  readonly updateTranscript: (id: string, value: string) => void
}

export interface ITranscript {
  readonly id: string
  readonly text: string
  readonly type: 'user' | 'ai'
}

export interface IState {
  readonly animationEnabled: boolean
  readonly animationFrame: number
  readonly animationScale: number
  readonly apiKeyError: string
  readonly apiKeyInput: string
  readonly hasOpenAiApiKey: boolean
  readonly inProgress: boolean
  readonly isCreatingToken: boolean
  readonly isSavingApiKey: boolean
  readonly isTest: boolean
  readonly parsedData: readonly any[]
  readonly sessionModel: RealtimeModelPreset
  readonly tokenError: string
  readonly transcribedText: string
  readonly transcripts: readonly ITranscript[]
  readonly uid: number
}

const createTokenErrorMessage = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return GptVoiceStrings.failedToCreateTokenWithDetails()
  }
  if (error.message.includes('401') || error.message.includes('403')) {
    return GptVoiceStrings.invalidOpenAiApiKey()
  }
  if (error.message.toLowerCase().includes('failed to fetch')) {
    return GptVoiceStrings.networkFailure()
  }
  if (error.message === 'NO_API_KEY') {
    return GptVoiceStrings.missingOpenAiApiKey()
  }
  return error.message || GptVoiceStrings.failedToCreateToken()
}

const openAiApiKeyRegex = /^sk-[A-Za-z0-9_-]{10,}$/

const isLikelyOpenAiApiKey = (value: string): boolean => {
  return openAiApiKeyRegex.test(value)
}

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveGptVoiceViewInstance> => {
  const openAiApiKeyStorage = createOpenAiApiKeyStorage(ExtensionApi)
  const hasTestMode = isInTestMode()
  let hasOpenAiApiKey = false
  try {
    const existingApiKey = await openAiApiKeyStorage.read()
    hasOpenAiApiKey =
      (existingApiKey !== undefined && existingApiKey.trim().length > 0) ||
      hasTestMode
  } catch {
    hasOpenAiApiKey = hasTestMode
  }

  let state: IState = {
    animationEnabled: false,
    animationFrame: -1,
    animationScale: 1,
    apiKeyError: '',
    apiKeyInput: '',
    hasOpenAiApiKey,
    inProgress: false,
    isCreatingToken: false,
    isSavingApiKey: false,
    isTest: hasTestMode,
    parsedData: [],
    sessionModel: defaultSessionModel,
    tokenError: '',
    transcribedText: '',
    transcripts: [],
    uid: -1,
  }
  let dataChannelPort: MessagePort | undefined

  const sendToDataChannel = async (data: string): Promise<void> => {
    if (!dataChannelPort) {
      throw new Error('data channel port not connected')
    }
    dataChannelPort.postMessage(data)
  }

  const handleFunctionCall = async (parsed: unknown): Promise<void> => {
    const messages =
      await VoiceFunctionCallingWorker.executeFunctionToolCall(parsed)
    for (const message of messages) {
      await sendToDataChannel(message)
    }
  }

  const requestRerender = (): void => {
    setTimeout(() => {
      context?.requestRerender()
    }, 100)
  }

  const getStoredApiKey = async (): Promise<string> => {
    const apiKey = await openAiApiKeyStorage.read()
    if (typeof apiKey !== 'string' || apiKey.trim().length === 0) {
      hasOpenAiApiKey = false
      state = {
        ...state,
        hasOpenAiApiKey,
      }
      throw new Error('NO_API_KEY')
    }
    hasOpenAiApiKey = true
    state = {
      ...state,
      hasOpenAiApiKey,
    }
    return apiKey
  }

  const instance: ActiveGptVoiceViewInstance = {
    addTranscript(id, value, type) {
      const { transcripts } = state
      state = {
        ...state,
        transcripts: [...transcripts, { id, text: value, type }],
      }
      context?.requestRerender()
    },
    createOrUpdateTranscript(parsed, type) {
      const { delta, item_id } = parsed
      const { transcripts } = state
      const entry = transcripts.find((item) => item.id === item_id)
      if (entry) {
        instance.updateTranscript(entry.id, entry.text + delta)
      } else {
        instance.addTranscript(item_id, delta, type)
      }
    },
    async doAnimate() {
      while (true) {
        const { animationEnabled, uid } = state
        if (!animationEnabled) {
          break
        }
        try {
          const data = await readMicLevels({
            uid,
          })
          await new Promise((resolve) => {
            requestAnimationFrame(resolve)
          })
          const { animationEnabled: isAnimationStillEnabled } = state
          if (!isAnimationStillEnabled) {
            break
          }
          const levelMic = readLevel(data.micAnalyzerData)
          const levelRemote = readLevel(data.remoteAnalyzerData)
          const anim = animateBubble(levelMic, levelRemote)
          instance.setAnimation(true, anim.scale)
        } catch (error) {
          console.error(error)
        }
      }
    },
    getContext() {
      return {}
    },
    getCss() {
      return getCss(state)
    },
    getMenuEntries() {
      return []
    },
    async handleClearOpenAiApiKey(): Promise<void> {
      const { inProgress, isCreatingToken, isSavingApiKey } = state
      if (inProgress || isCreatingToken || isSavingApiKey) {
        return
      }
      state = {
        ...state,
        isSavingApiKey: true,
      }
      requestRerender()
      try {
        await openAiApiKeyStorage.delete()
        hasOpenAiApiKey = false
        state = {
          ...state,
          apiKeyError: '',
          apiKeyInput: '',
          hasOpenAiApiKey,
          isSavingApiKey: false,
          tokenError: '',
        }
      } catch {
        state = {
          ...state,
          apiKeyError: GptVoiceStrings.failedToClearOpenAiApiKey(),
          isSavingApiKey: false,
        }
      }
      requestRerender()
    },
    async handleClickStart(): Promise<void> {
      const {
        hasOpenAiApiKey: hasApiKey,
        inProgress,
        isCreatingToken,
        isSavingApiKey,
        isTest,
      } = state
      if (isCreatingToken || isSavingApiKey) {
        return
      }
      if (inProgress) {
        state = {
          ...state,
          inProgress: false,
        }
        await instance.stop()
        return
      }
      if (isTest || isInTestMode()) {
        hasOpenAiApiKey = true
        state = {
          ...state,
          hasOpenAiApiKey,
          inProgress: true,
          isTest: true,
          tokenError: '',
        }
        requestRerender()
        return
      }
      if (!hasApiKey) {
        state = {
          ...state,
          apiKeyError: '',
          tokenError: GptVoiceStrings.missingOpenAiApiKeyPrompt(),
        }
        requestRerender()
        return
      }
      state = {
        ...state,
        isCreatingToken: true,
        tokenError: '',
      }
      requestRerender()
      try {
        const apiKey = await getStoredApiKey()
        const { sessionModel } = state
        const registeredTools =
          await VoiceFunctionCallingWorker.getRegisteredTools()

        const ephemeralKey = await getEphemeralKey(
          apiKey,
          createSessionConfig(sessionModel, registeredTools),
        )
        const { port1, port2 } = new MessageChannel()
        // eslint-disable-next-line @typescript-eslint/prefer-readonly-parameter-types
        port2.onmessage = (event: MessageEvent): void => {
          const portData =
            typeof event.data === 'string'
              ? event.data
              : JSON.stringify(event.data)
          if (typeof portData === 'string') {
            instance.handleData(portData)
          }
        }
        port2.start()
        dataChannelPort = port2
        state = {
          ...state,
          inProgress: true,
        }
        const { uid } = state
        const offerSdp = await startWebRtcAudioStream({
          elementLocator: `.${ClassNames.GptVoiceAudio}`,
          ephemeralKey,
          port: port1,
          trackAudioData: true,
          uid,
        })
        if (!offerSdp) {
          throw new Error('offer sdp is required')
        }
        const answerSdp = await getSdp(offerSdp, ephemeralKey)
        await setRemoteDescription({
          sdp: answerSdp,
          type: 'answer',
          uid,
        })

        const { isTest: isCurrentlyTest } = state
        if (!isCurrentlyTest) {
          state = {
            ...state,
            animationEnabled: true,
          }
          instance.doAnimate()
        }

        state = {
          ...state,
          isCreatingToken: false,
        }
        requestRerender()
      } catch (error) {
        const { hasOpenAiApiKey: currentHasOpenAiApiKey } = state
        const nextApiKeyStatus =
          error instanceof Error && error.message === 'NO_API_KEY'
            ? false
            : currentHasOpenAiApiKey
        if (dataChannelPort) {
          dataChannelPort.close()
          dataChannelPort = undefined
        }
        state = {
          ...state,
          hasOpenAiApiKey: nextApiKeyStatus,
          inProgress: false,
          isCreatingToken: false,
          tokenError: createTokenErrorMessage(error),
        }
        hasOpenAiApiKey = nextApiKeyStatus
        console.error(error)
        requestRerender()
      }
    },
    handleData(data: string): void {
      const parsed = JSON.parse(data)
      const { parsedData } = state
      state = {
        ...state,
        parsedData: [...parsedData, parsed],
      }

      void handleFunctionCall(parsed).catch((error) => {
        console.error(error)
      })

      if (parsed && parsed.type === 'response.output_audio_transcript.delta') {
        instance.handleOutputTranscript(parsed)
      }
      if (
        parsed &&
        parsed.type === 'conversation.item.input_audio_transcription.delta'
      ) {
        instance.handleInputTranscript(parsed)
      }
    },
    handleInputTranscript(parsed) {
      instance.createOrUpdateTranscript(parsed, 'user')
    },
    handleOpenAiApiKeyInput(value: string): void {
      const { isSavingApiKey } = state
      if (isSavingApiKey) {
        return
      }
      state = {
        ...state,
        apiKeyError: '',
        apiKeyInput: value,
        tokenError: '',
      }
      context?.requestRerender()
    },
    handleOutputTranscript(parsed) {
      instance.createOrUpdateTranscript(parsed, 'ai')
    },
    async handleSaveOpenAiApiKey(): Promise<void> {
      const { apiKeyInput } = state
      const apiKey = apiKeyInput.trim()
      if (!apiKey) {
        state = {
          ...state,
          apiKeyError: GptVoiceStrings.openAiApiKeyRequired(),
          tokenError: '',
        }
        requestRerender()
        return
      }
      if (!isLikelyOpenAiApiKey(apiKey)) {
        state = {
          ...state,
          apiKeyError: GptVoiceStrings.invalidOpenAiApiKeyFormat(),
          tokenError: '',
        }
        requestRerender()
        return
      }
      state = {
        ...state,
        apiKeyError: '',
        isSavingApiKey: true,
      }
      requestRerender()
      try {
        await openAiApiKeyStorage.write(apiKey)
        hasOpenAiApiKey = true
        state = {
          ...state,
          apiKeyError: '',
          apiKeyInput: '',
          hasOpenAiApiKey,
          isSavingApiKey: false,
          tokenError: '',
        }
      } catch {
        state = {
          ...state,
          apiKeyError: GptVoiceStrings.failedToSaveOpenAiApiKey(),
          isSavingApiKey: false,
        }
      }
      requestRerender()
    },
    render() {
      return render(state)
    },
    renderActionsDom(): readonly VirtualDomNode[] {
      return [actionsDomNode, text(GptVoiceStrings.helloWorld())]
    },
    renderFocus(
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ): string {
      return focusSelector
    },
    renderSelections(): readonly ViewSelection[] {
      return []
    },
    renderTitle(): string {
      return getTitle(state)
    },
    saveState(): unknown {
      return {}
    },
    setAnimation(enabled, scale) {
      state = {
        ...state,
        animationEnabled: enabled,
        animationScale: scale,
      }
      context?.requestRerender()
    },
    setRealtimeModelMini() {
      const { inProgress, sessionModel } = state
      if (inProgress) {
        return
      }
      if (sessionModel === RealtimeModelPreset.Mini) {
        return
      }
      state = {
        ...state,
        sessionModel: RealtimeModelPreset.Mini,
      }
      requestRerender()
    },
    setRealtimeModelStandard() {
      const { inProgress, sessionModel } = state
      if (inProgress) {
        return
      }
      if (sessionModel === RealtimeModelPreset.Standard) {
        return
      }
      state = {
        ...state,
        sessionModel: RealtimeModelPreset.Standard,
      }
      requestRerender()
    },
    async stop() {
      state = {
        ...state,
        animationEnabled: false,
        animationScale: 1,
        inProgress: false,
      }
      try {
        const { isTest, uid } = state
        if (!isTest) {
          await stopWebRtcAudioStream(uid)
        }
      } finally {
        if (dataChannelPort) {
          dataChannelPort.close()
          dataChannelPort = undefined
        }
      }
      await context?.requestRerender()
    },

    updateTranscript(id, value) {
      const { transcripts } = state
      const index = transcripts.findIndex((item) => item.id === id)
      if (index === -1) {
        return
      }
      const old = transcripts[index]
      state = {
        ...state,
        transcripts: transcripts.with(index, {
          ...old,
          text: value,
        }),
      }
      context?.requestRerender()
    },
  }

  return instance
}
