import type { Server } from 'http'
import { configDotenv } from 'dotenv'
import express, { type Request, type Response } from 'express'
import path, { join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
configDotenv({
  path: join(root, '.env'),
  quiet: true,
})

const app = express()
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    '⚠️  OPENAI_API_KEY is not set. Set it before starting the server:\n' +
      '   export OPENAI_API_KEY=sk-...\n',
  )
}

app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*') // TODO: lock this down in production
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  next()
})

app.options('/token', (_req, res) => {
  res.status(204).end()
})

app.use(express.static(path.join(__dirname, 'public')))

// Browser calls this to get a short-lived ephemeral key (expires in ~1 min,
// but that's fine — it's only used to open the WebRTC connection).
const DEFAULT_SESSION_CONFIG = {
  session: {
    audio: {
      input: {
        transcription: { model: 'gpt-4o-mini-transcribe' },
      },
      output: {
        voice: 'marin',
      },
    },
    model: 'gpt-realtime-2.1-mini',
    type: 'realtime',
  },
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const extractSessionConfig = (body: unknown) => {
  if (!isObject(body)) {
    return DEFAULT_SESSION_CONFIG
  }
  if (!('session' in body)) {
    return DEFAULT_SESSION_CONFIG
  }
  return body
}

const sendToken = async (res: Response, sessionConfig: unknown) => {
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
    res.json(data)
  } catch (error) {
    console.error('Token generation error:', error)
    res.status(500).json({ error: 'Failed to generate token' })
  }
}

app.get('/token', async (req, res) => {
  await sendToken(res, DEFAULT_SESSION_CONFIG)
})

app.post('/token', async (req: Request<unknown>, res) => {
  const sessionConfig = extractSessionConfig(req.body)
  await sendToken(res, sessionConfig)
})

const servers: Record<string, Server> = Object.create(null)

export const startServer = async (id: string, port: number): Promise<void> => {
  const { promise, resolve } = Promise.withResolvers<void>()
  const server = app.listen(port, () => {
    resolve(undefined)
  })
  servers[id] = server
  await promise
}

export const stopServer = async (id: string) => {
  const server = servers[id]
  delete servers[id]
  const { promise, resolve } = Promise.withResolvers<void>()
  server.close(() => {
    resolve()
  })
  await promise
}
