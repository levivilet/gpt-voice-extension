import {
  setRemoteDescription,
  startWebRtcAudioStream,
  stopWebRtcAudioStream,
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import { getTitle } from '../GetTitle/GetTitle.ts'
import type { MenuEntry } from '../MenuEntries/MenuEntries.ts'
import { render } from '../Render/Render.ts'
import { getEphemeralKey, getSdp } from '../WebRtc/WebRtc.ts'

export interface ActiveGptVoiceViewInstance extends VirtualDomViewInstance {
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleClickStart: () => Promise<void>
  readonly stop: () => Promise<void>
  readonly renderTitle: () => string
  readonly handleData: (data: string) => void
}

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveGptVoiceViewInstance> => {
  const state = {
    inProgress: false,
    serverId: crypto.randomUUID(),
    uid: -1,
    transcribedText: ``,
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
    async stop() {
      await stopWebRtcAudioStream(state.uid)
    },
    async handleData(data: string) {
      const parsed = JSON.parse(data)
      console.log(parsed)
      if (parsed && parsed.type === 'response.output_audio_transcript.delta') {
        state.transcribedText += parsed.delta
        requestRerender()
      }
    },
    async handleClickStart(): Promise<void> {
      // TODO create node rpc (starting node app)
      // TODO start node server
      try {
        if (state.inProgress) {
          state.inProgress = false
          await this.stop()
          return
        }
        state.inProgress = !state.inProgress

        const ephemeralKey = await getEphemeralKey(state.serverId)
        console.log({ ephemeralKey })
        const offerSdp = await startWebRtcAudioStream({
          elementLocator: '.GptVoiceAudio',
          ephemeralKey,
          uid: state.uid,
          onData(data) {
            instance.handleData(data)
          },
        })
        if (!offerSdp) {
          throw new Error(`offer sdp is required`)
        }
        const answerSdp = await getSdp(offerSdp, ephemeralKey)
        console.log({ offerSdp, answerSdp })
        await setRemoteDescription({
          sdp: answerSdp,
          type: 'answer',
          uid: state.uid,
        })
        console.log('all worked')

        requestRerender()
      } catch (error) {
        console.error(error)
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
  }
  return instance
}
