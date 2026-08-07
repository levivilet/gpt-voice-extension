import * as Rpc from '../Rpc/Rpc.ts'

export const defaultSessionConfig = {
  session: {
    audio: {
      input: {
        transcription: { model: 'gpt-4o-transcribe' },
      },
      output: {
        voice: 'marin',
      },
    },
    model: 'gpt-realtime-2.1',
    type: 'realtime',
  },
}

export const getEphemeralKey = async (
  serverId: string,
  sessionConfig: unknown = defaultSessionConfig,
): Promise<string> => {
  // 1. Get a short-lived ephemeral key from our own backend.
  const serverPort = 3333 // TODO maybe use random port?
  await Rpc.invoke('GptVoice.startServer', serverId, serverPort)
  const tokenBaseUrl = `http://localhost:${serverPort}`
  const tokenUrl = new URL('/token', tokenBaseUrl).href
  const tokenRes = await fetch(tokenUrl, {
    body: JSON.stringify(sessionConfig),
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
  })
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

export const getSdp = async (
  offerSdp: string,
  ephemeralKey: string,
): Promise<string> => {
  const sdpResponse = await fetch('https://api.openai.com/v1/realtime/calls', {
    body: offerSdp,
    headers: {
      Authorization: `Bearer ${ephemeralKey}`,
      'Content-Type': 'application/sdp',
    },
    method: 'POST',
  })
  const answerSdp = await sdpResponse.text()
  return answerSdp
}
