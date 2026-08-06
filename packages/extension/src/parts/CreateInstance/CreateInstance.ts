import {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
  startWebRtcAudioStream,
  setRemoteDescription,
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

import * as Rpc from '../Rpc/Rpc.ts'

export interface ActiveGptVoiceViewInstance extends VirtualDomViewInstance {
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]
  readonly handleClickStart: () => Promise<void>
  readonly stop: () => Promise<void>
  readonly renderTitle: () => string
  readonly handleData: (data: string) => void
}

const getEphemeralKey = async (serverId: string): Promise<string> => {
  // 1. Get a short-lived ephemeral key from our own backend.
  const serverPort = 3333 // TODO maybe use random port?
  await Rpc.invoke('GptVoice.startServer', serverId, serverPort)
  const tokenBaseUrl = `http://localhost:${serverPort}`
  const tokenUrl = new URL('/token', tokenBaseUrl).toString()
  const tokenRes = await fetch(tokenUrl)
  const tokenData = await tokenRes.json()
  if (!tokenRes.ok) {
    console.error(`failed to fetch token`)
    console.error(tokenData)
    return ''
  }
  const ephemeralKey = tokenData.value
  await Rpc.invoke('GptVoice.stopServer', serverId)
  return ephemeralKey
}

const getSdp = async (
  offerSdp: string,
  ephemeralKey: string,
): Promise<string> => {
  const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
    method: 'POST',
    body: offerSdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      'Content-Type': 'application/sdp',
    },
  })
  const answerSdp = await sdpResponse.text()
  return answerSdp
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
