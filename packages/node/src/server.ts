import express from 'express'
import { Server } from 'http'
import path, { join } from 'path'
import { fileURLToPath } from 'url'
import { configDotenv } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
configDotenv({
  path: join(root, '.env'),
})

const app = express()
app.use(express.static(path.join(__dirname, 'public')))

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    '⚠️  OPENAI_API_KEY is not set. Set it before starting the server:\n' +
      '   export OPENAI_API_KEY=sk-...\n',
  )
}

app.use(express.static(path.join(__dirname, 'public')))

// Session config: which model, voice, and transcription settings to use.
// input.transcription turns on live speech-to-text for the user's mic audio.
const sessionConfig = {
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

// Browser calls this to get a short-lived ephemeral key (expires in ~1 min,
// but that's fine — it's only used to open the WebRTC connection).
app.get('/token', async (req, res) => {
  try {
    const response = await fetch(
      'https://api.openai.com/v1/realtime/client_secrets',
      {
        body: JSON.stringify(sessionConfig),
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      },
    )
    const data = await response.json()
    if (!response.ok) {
      console.error('Token error:', data)
      return res.status(response.status).json(data)
    }
    res.setHeader(
      'Access-Control-Allow-Origin',
      '*', // TODO
    )
    res.json(data)
  } catch (error) {
    console.error('Token generation error:', error)
    res.status(500).json({ error: 'Failed to generate token' })
  }
})

const servers: Record<string, Server> = Object.create(null)

export const startServer = async (id: string, port: number): Promise<void> => {
  const { resolve, promise } = Promise.withResolvers<void>()
  const server = app.listen(port, () => {
    resolve(undefined)
  })
  servers[id] = server
  await promise
}

export const stopServer = async (id: string) => {
  const server = servers[id]
  delete servers[id]
  const { resolve, promise } = Promise.withResolvers<void>()
  server.close(() => {
    resolve()
  })
  await promise
}
