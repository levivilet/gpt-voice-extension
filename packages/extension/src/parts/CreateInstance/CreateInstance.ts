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
import { handleFunctionCall } from '../FunctionCalling/FunctionCalling.ts'
import { getTitle } from '../GetTitle/GetTitle.ts'
import { createOpenAiApiKeyStorage } from '../OpenAiApiKeyStorage/OpenAiApiKeyStorage.ts'
import { readLevel } from '../ReadLevel/ReadLevel.ts'
import { render } from '../Render/Render.ts'
import { isInTestMode } from '../TestMode/TestMode.ts'
import {
  createSessionConfig,
  defaultSessionModel,
  getEphemeralKey,
  RealtimeModelPreset,
  getSdp,
} from '../WebRtc/WebRtc.ts'

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
    return 'Failed to create token. Check your network and API key.'
  }
  if (error.message.includes('401') || error.message.includes('403')) {
    return 'OpenAI API key is invalid (401/403).'
  }
  if (error.message.toLowerCase().includes('failed to fetch')) {
    return 'Network failure while creating token. Retry and check your internet connection.'
  }
  if (error.message === 'NO_API_KEY') {
    return 'NO_API_KEY: OpenAI API key is not set.'
  }
  return error.message || 'Failed to create token.'
}

const getMissingApiKeyMessage = (): string =>
  'NO_API_KEY: Add your OpenAI API key above to start.'

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
      state = {
        ...state,
        transcripts: [...state.transcripts, { id, text: value, type }],
      }
      context?.requestRerender()
    },
    createOrUpdateTranscript(parsed, type) {
      const { delta, item_id } = parsed
      const entry = state.transcripts.find((item) => item.id === item_id)
      if (entry) {
        instance.updateTranscript(entry.id, entry.text + delta)
      } else {
        instance.addTranscript(item_id, delta, type)
      }
    },
    async doAnimate() {
      while (state.animationEnabled) {
        try {
          const data = await readMicLevels({
            uid: state.uid,
          })
          await new Promise((resolve) => {
            requestAnimationFrame(resolve)
          })
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
      return `.GptVoice {
--GptVoiceBubbleTransform: scale(${state.animationScale});
}`
    },
    getMenuEntries() {
      return []
    },
    async handleClearOpenAiApiKey(): Promise<void> {
      if (state.inProgress || state.isCreatingToken || state.isSavingApiKey) {
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
          apiKeyError: 'Failed to clear OpenAI API key.',
          isSavingApiKey: false,
        }
      }
      requestRerender()
    },
    async handleClickStart(): Promise<void> {
      if (state.isCreatingToken || state.isSavingApiKey) {
        return
      }
      if (state.inProgress) {
        state = {
          ...state,
          inProgress: false,
        }
        await instance.stop()
        return
      }
      if (state.isTest || isInTestMode()) {
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
      if (!state.hasOpenAiApiKey) {
        state = {
          ...state,
          apiKeyError: '',
          tokenError: getMissingApiKeyMessage(),
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

        const ephemeralKey = await getEphemeralKey(
          apiKey,
          createSessionConfig(state.sessionModel),
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
        const offerSdp = await startWebRtcAudioStream({
          elementLocator: '.GptVoiceAudio',
          ephemeralKey,
          port: port1,
          trackAudioData: true,
          uid: state.uid,
        })
        if (!offerSdp) {
          throw new Error('offer sdp is required')
        }
        const answerSdp = await getSdp(offerSdp, ephemeralKey)
        await setRemoteDescription({
          sdp: answerSdp,
          type: 'answer',
          uid: state.uid,
        })

        if (!state.isTest) {
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
        const nextApiKeyStatus =
          error instanceof Error && error.message === 'NO_API_KEY'
            ? false
            : state.hasOpenAiApiKey
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
      state = {
        ...state,
        parsedData: [...state.parsedData, parsed],
      }

      void handleFunctionCall(parsed, sendToDataChannel).catch((error) => {
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
      if (state.isSavingApiKey) {
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
      const apiKey = state.apiKeyInput.trim()
      if (!apiKey) {
        state = {
          ...state,
          apiKeyError: 'OpenAI API key is required.',
          tokenError: '',
        }
        requestRerender()
        return
      }
      if (!isLikelyOpenAiApiKey(apiKey)) {
        state = {
          ...state,
          apiKeyError: 'OpenAI API key format looks invalid.',
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
          apiKeyError: 'Failed to save OpenAI API key.',
          isSavingApiKey: false,
        }
      }
      requestRerender()
    },
    render() {
      return render(state)
    },
    renderActionsDom(): readonly VirtualDomNode[] {
      return [
        {
          childCount: 1,
          className: 'main',
          type: VirtualDomElements.Div,
        },
        text('hello world'),
      ]
    },
    renderFocus(
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ): string {
      return '.main'
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
        animationEnabled: false,
        animationScale: scale,
      }
      context?.requestRerender()
    },
    setRealtimeModelMini() {
      if (state.inProgress) {
        return
      }
      if (state.sessionModel === RealtimeModelPreset.Mini) {
        return
      }
      state = {
        ...state,
        sessionModel: RealtimeModelPreset.Mini,
      }
      requestRerender()
    },
    setRealtimeModelStandard() {
      if (state.inProgress) {
        return
      }
      if (state.sessionModel === RealtimeModelPreset.Standard) {
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
        inProgress: false,
      }
      try {
        if (!state.isTest) {
          await stopWebRtcAudioStream(state.uid)
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
      const index = state.transcripts.findIndex((item) => item.id === id)
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
