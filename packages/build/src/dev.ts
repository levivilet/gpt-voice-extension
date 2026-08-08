import * as esbuild from 'esbuild'
import { spawn } from 'node:child_process'
import path from 'node:path'
import { root } from './root.ts'

const extension = path.join(root, 'packages', 'extension')
const voiceFunctionCallingWorker = path.join(
  root,
  'packages',
  'voice-function-calling-worker',
)
const outdir = path.join(extension, 'dist')

const context = await esbuild.context({
  bundle: true,
  entryPoints: {
    gptVoiceMain: path.join(extension, 'src', 'gptVoiceMain.ts'),
    voiceFunctionCallingWorkerMain: path.join(
      voiceFunctionCallingWorker,
      'src',
      'voiceFunctionCallingWorkerMain.ts',
    ),
  },
  external: ['electron', 'node:*'],
  format: 'esm',
  outdir,
  platform: 'browser',
  sourcemap: true,
  target: 'esnext',
})

await context.rebuild()
await context.watch()

const server = spawn(
  process.execPath,
  [
    path.join(
      root,
      'node_modules',
      '@lvce-editor',
      'server',
      'bin',
      'server.js',
    ),
    '--only-extension=packages/extension',
    '--test-path=packages/e2e',
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      PORT: process.env.PORT || '3000',
    },
    stdio: 'inherit',
  },
)

const stop = async () => {
  server.kill()
  await context.dispose()
}

process.on('SIGINT', async () => {
  await stop()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await stop()
  process.exit(0)
})

server.on('exit', async (code) => {
  await context.dispose()
  process.exit(code ?? 0)
})
