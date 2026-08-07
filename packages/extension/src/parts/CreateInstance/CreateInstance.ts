import type {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
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
import { getTitle } from '../GetTitle/GetTitle.ts'
import { readLevel } from '../ReadLevel/ReadLevel.ts'
import { render } from '../Render/Render.ts'
import { getEphemeralKey, getSdp } from '../WebRtc/WebRtc.ts'

export interface ActiveGptVoiceViewInstance extends VirtualDomViewInstance {
  readonly addTranscript: (
    id: string,
    value: string,
    type: 'user' | 'ai',
  ) => void
  readonly debugData: () => void
  readonly doAnimate: () => Promise<void>
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleClickStart: () => Promise<void>
  readonly handleData: (data: string) => void
  readonly renderTitle: () => string
  readonly setAnimation: (enabled: boolean, scale: number) => void
  readonly setIsTest: () => void
  readonly stop: () => Promise<void>
  readonly updateTranscript: (id: string, value: string) => void
  readonly handleInputTranscript: (parsed: any) => void
  readonly handleOutputTranscript: (parsed: any) => void
  readonly createOrUpdateTranscript: (parsed: any, type: 'user' | 'ai') => void
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
  readonly inProgress: boolean
  readonly isTest: boolean
  readonly parsedData: readonly any[]
  readonly serverId: string
  readonly transcripts: readonly ITranscript[]
  readonly uid: number
}

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveGptVoiceViewInstance> => {
  let state: IState = {
    animationEnabled: false,
    animationFrame: -1,
    animationScale: 1,
    inProgress: false,
    isTest: false,
    parsedData: [],
    serverId: crypto.randomUUID(),
    transcripts: [],
    uid: -1,
  }

  const requestRerender = (): void => {
    setTimeout(() => {
      context?.requestRerender()
    }, 100)
  }

  const instance: ActiveGptVoiceViewInstance = {
    addTranscript(id, value, type) {
      state = {
        ...state,
        transcripts: [...state.transcripts, { id, text: value, type }],
      }
      context?.requestRerender()
    },
    debugData() {
      // eslint-disable-next-line no-console
      console.info(state.parsedData)
      // eslint-disable-next-line no-console
      console.info(state.transcripts)
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
    async handleClickStart(): Promise<void> {
      // TODO create node rpc (starting node app)
      // TODO start node server
      try {
        if (state.inProgress) {
          state = {
            ...state,
            inProgress: false,
          }
          await instance.stop()
          return
        }
        state = {
          ...state,
          inProgress: !state.inProgress,
        }

        if (state.isTest) {
          return
        }

        const ephemeralKey = await getEphemeralKey(state.serverId)
        const offerSdp = await startWebRtcAudioStream({
          elementLocator: '.GptVoiceAudio',
          ephemeralKey,
          onData(data) {
            instance.handleData(data)
          },
          trackAudioData: true,
          uid: state.uid,
        })
        if (!offerSdp) {
          throw new Error(`offer sdp is required`)
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

        requestRerender()
      } catch (error) {
        console.error(error)
      }
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
    handleOutputTranscript(parsed) {
      instance.createOrUpdateTranscript(parsed, 'ai')
    },
    handleInputTranscript(parsed) {
      instance.createOrUpdateTranscript(parsed, 'user')
    },
    handleData(data: string): void {
      const parsed = JSON.parse(data)
      state = {
        ...state,
        parsedData: [...state.parsedData, parsed],
      }

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
    setIsTest() {
      state = {
        ...state,
        isTest: true,
      }
    },
    async stop() {
      state = {
        ...state,
        inProgress: false,
      }
      if (!state.isTest) {
        await stopWebRtcAudioStream(state.uid)
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
