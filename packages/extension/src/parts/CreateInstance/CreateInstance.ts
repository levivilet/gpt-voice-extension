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
  readonly doAnimate: () => Promise<void>
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleClickStart: () => Promise<void>
  readonly handleData: (data: string) => void
  readonly updateTranscript: (id: string, value: string) => void
  readonly addTranscript: (
    id: string,
    value: string,
    type: 'user' | 'ai',
  ) => void
  readonly renderTitle: () => string
  readonly setAnimation: (enabled: boolean, scale: number) => void
  readonly setIsTest: () => void
  readonly stop: () => Promise<void>
}

export interface ITranscript {
  readonly type: 'user' | 'ai'
  readonly text: string
  readonly id: string
}

export interface IState {
  readonly animationEnabled: boolean
  readonly animationFrame: number
  readonly animationScale: number
  readonly inProgress: boolean
  readonly isTest: boolean
  readonly serverId: string
  readonly uid: number
  readonly transcripts: readonly ITranscript[]
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
    serverId: crypto.randomUUID(),
    uid: -1,
    transcripts: [],
  }

  const requestRerender = (): void => {
    setTimeout(() => {
      context?.requestRerender()
    }, 100)
  }

  const instance: ActiveGptVoiceViewInstance = {
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
    handleData(data: string): void {
      const parsed = JSON.parse(data)
      globalThis.__alData ||= []
      globalThis.__alData.push(parsed)
      console.log({ parsed })
      if (parsed && parsed.type === 'response.output_audio_transcript.delta') {
        const entry = state.transcripts.find((item) => item.id)
        if (entry) {
          instance.updateTranscript(entry.id, entry.text + parsed.delta)
        } else {
          instance.addTranscript(parsed.item_id, parsed.delta, 'ai')
        }
      }
      if (
        parsed &&
        parsed.type === 'conversation.item.input_audio_transcription.delta'
      ) {
        const entry = state.transcripts.find((item) => item.id)
        if (entry) {
          instance.updateTranscript(entry.id, entry.text + parsed.delta)
        } else {
          instance.addTranscript(parsed.item_id, parsed.delta, 'user')
        }
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
    updateTranscript(id, value) {
      const index = state.transcripts.findIndex((item) => item.id === id)
      if (index === -1) {
        return
      }
      state = {
        ...state,
        transcripts: [
          ...state.transcripts.slice(0, index),
          { ...state.transcripts[index], text: value },
          ...state.transcripts.slice(index + 1),
        ],
      }
      context?.requestRerender()
    },
    addTranscript(id, value, type = 'ai') {
      state = {
        ...state,
        transcripts: [...state.transcripts, { id, type, text: value }],
      }
      context?.requestRerender()
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
  }
  return instance
}
