import * as Rpc from '../Rpc/Rpc.ts'

export const getEphemeralKey = async (serverId: string): Promise<string> => {
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

export const getSdp = async (
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
