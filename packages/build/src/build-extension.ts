import * as esbuild from 'esbuild'
import fs from 'node:fs'
import path from 'node:path'
import { root } from './root.ts'

const extension = path.join(root, 'packages', 'extension')
const voiceFunctionCallingWorker = path.join(
  root,
  'packages',
  'voice-function-calling-worker',
)
const outdir = path.join(extension, 'dist')

fs.rmSync(outdir, { recursive: true, force: true })
fs.mkdirSync(outdir, { recursive: true })

await esbuild.build({
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
