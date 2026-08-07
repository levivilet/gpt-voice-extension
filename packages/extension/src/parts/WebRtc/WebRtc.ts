import * as Rpc from '../Rpc/Rpc.ts'

export enum RealtimeModelPreset {
  Mini = 'gpt-realtime-2.1-mini',
  Standard = 'gpt-realtime-2.1',
}

type TranscriptionModel = 'gpt-4o-mini-transcribe' | 'gpt-4o-transcribe'
type ServerVadMode = 'server_vad'
type TurnDetectionConfig = {
  readonly create_response: boolean
  readonly interrupt_response: boolean
  readonly prefix_padding_ms: number
  readonly silence_duration_ms: number
  readonly threshold: number
  readonly type: ServerVadMode
}

type NoiseReductionMode = 'near_field' | 'far_field'
type NoiseReductionConfig = {
  readonly type: NoiseReductionMode
}

type WeatherResult = {
  readonly conditions: string
  readonly humidity: number
  readonly temperature: number
  readonly unit: 'C' | 'F'
}

const normalizeLocation = (value: unknown) => {
  if (typeof value !== 'string') {
    return 'unknown'
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return 'unknown'
  }
  return trimmed.toLowerCase()
}

const fakeWeatherByLocation: Record<string, WeatherResult> = {
  france: {
    conditions: 'Cloudy',
    humidity: 76,
    temperature: 18,
    unit: 'C',
  },
  london: {
    conditions: 'Rain',
    humidity: 84,
    temperature: 14,
    unit: 'C',
  },
  paris: {
    conditions: 'Sunny',
    humidity: 58,
    temperature: 20,
    unit: 'C',
  },
}

export const getFakeWeather = (location: unknown): WeatherResult & { location: string } => {
  const normalizedLocation = normalizeLocation(location)
  return {
    location: normalizedLocation,
    ...(
      fakeWeatherByLocation[normalizedLocation] ?? {
        conditions: 'Partly cloudy',
        humidity: 65,
        temperature: 21,
        unit: 'C',
      }
    ),
  }
}

const getTranscriptionModel = (
  sessionModel: RealtimeModelPreset,
): TranscriptionModel => {
  if (sessionModel === RealtimeModelPreset.Mini) {
    return 'gpt-4o-mini-transcribe'
  }
  return 'gpt-4o-transcribe'
}

export const defaultSessionModel: RealtimeModelPreset = RealtimeModelPreset.Mini

type SessionConfig = {
  readonly session: {
    readonly instructions: string
    readonly tool_choice: 'auto' | 'none' | 'required'
    readonly tools: readonly {
      readonly name: 'getweather'
      readonly type: 'function'
      readonly description: string
      readonly parameters: {
        readonly type: 'object'
        readonly properties: {
          readonly location: {
            readonly type: 'string'
            readonly description: string
          }
        }
        readonly required: readonly ['location']
        readonly additionalProperties: false
      }
    }[]
    readonly audio: {
      readonly input: {
        readonly transcription: {
          readonly model: TranscriptionModel
        }
        readonly turn_detection: TurnDetectionConfig
        readonly noise_reduction: NoiseReductionConfig
      }
      readonly output: {
        readonly voice: 'marin'
      }
    }
    readonly model: RealtimeModelPreset
    readonly type: 'realtime'
  }
}

export const createSessionConfig = (
  sessionModel: RealtimeModelPreset,
): SessionConfig => {
  const getWeatherTool = {
    description: 'Get weather for a location.',
    name: 'getweather',
    parameters: {
      additionalProperties: false,
      properties: {
        location: {
          description: 'Location to get the weather for',
          type: 'string',
        },
      },
      required: ['location'],
      type: 'object',
    },
    type: 'function',
  } as const

  return {
    session: {
      audio: {
        input: {
          noise_reduction: {
            type: 'near_field',
          },
          transcription: { model: getTranscriptionModel(sessionModel) },
          turn_detection: {
            create_response: true,
            interrupt_response: false,
            prefix_padding_ms: 300,
            silence_duration_ms: 800,
            threshold: 0.7,
            type: 'server_vad',
          },
        },
        output: {
          voice: 'marin',
        },
      },
      instructions:
        'You are a voice assistant with access to tools. If the user asks about weather, call getweather with a location argument.',
      model: sessionModel,
      tool_choice: 'auto',
      tools: [getWeatherTool],
      type: 'realtime',
    },
  }
}

export const defaultSessionConfig = createSessionConfig(defaultSessionModel)

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
