import type {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import {
  setRemoteDescription,
  startWebRtcAudioStream,
  stopWebRtcAudioStream,
} from '@lvce-editor/api'
import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { MenuEntry } from '../MenuEntries/MenuEntries.ts'
import { getTitle } from '../GetTitle/GetTitle.ts'
import { render } from '../Render/Render.ts'
import { getEphemeralKey, getSdp } from '../WebRtc/WebRtc.ts'

export interface ActiveGptVoiceViewInstance extends VirtualDomViewInstance {
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleClickStart: () => Promise<void>
  readonly handleData: (data: string) => void
  readonly renderTitle: () => string
  readonly setAnimation: (enabled: boolean, scale: number) => void
  readonly setIsTest: () => void
  readonly setTranscript: (value: string) => void
  readonly stop: () => Promise<void>
}

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveGptVoiceViewInstance> => {
  const state = {
    animationEnabled: false,
    animationScale: 1,
    inProgress: false,
    isTest: false,
    serverId: crypto.randomUUID(),
    transcribedText: ``,
    uid: -1,
  }

  const requestRerender = (): void => {
    setTimeout(() => {
      context?.requestRerender()
    }, 100)
  }

  const instance: ActiveGptVoiceViewInstance = {
    getContext() {
      return {}
    },
    getCss() {
      return ''
    },
    getMenuEntries() {
      return []
    },
    async handleClickStart(): Promise<void> {
      // TODO create node rpc (starting node app)
      // TODO start node server
      try {
        if (state.inProgress) {
          state.inProgress = false
          await instance.stop()
          return
        }
        state.inProgress = !state.inProgress

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

        requestRerender()
      } catch (error) {
        console.error(error)
      }
    },
    handleData(data: string): void {
      const parsed = JSON.parse(data)
      if (parsed && parsed.type === 'response.output_audio_transcript.delta') {
        instance.setTranscript(state.transcribedText + parsed.delta)
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
      state.animationEnabled = enabled
      state.animationScale = scale
    },
    setIsTest() {
      state.isTest = true
    },
    setTranscript(value) {
      state.transcribedText = value
      context?.requestRerender()
    },

    async stop() {
      state.inProgress = false
      if (!state.isTest) {
        await stopWebRtcAudioStream(state.uid)
      }
      await context?.requestRerender()
    },
  }
  return instance
}
