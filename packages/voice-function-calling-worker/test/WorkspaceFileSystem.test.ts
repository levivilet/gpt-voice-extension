import { expect, jest, test } from '@jest/globals'
import {
  readWorkspaceFile,
  resolveWorkspaceFilePath,
  type WorkspaceFileSystemApi,
  writeWorkspaceFile,
} from '../src/parts/WorkspaceFileSystem/WorkspaceFileSystem.ts'

const createApi = (workspaceFolder = '/workspace'): WorkspaceFileSystemApi => ({
  getWorkspaceFolder: jest.fn(async () => workspaceFolder),
  readFile: jest.fn(async () => 'file content'),
  writeFile: jest.fn(async () => undefined),
})

test.each([
  ['/workspace', 'src/index.ts', '/workspace/src/index.ts'],
  ['/workspace/', './src/index.ts', '/workspace/src/index.ts'],
  ['github://owner/repo', 'src\\index.ts', 'github://owner/repo/src/index.ts'],
  ['C:\\workspace', 'src/index.ts', 'C:\\workspace\\src\\index.ts'],
])(
  'resolveWorkspaceFilePath - resolves %s and %s',
  (workspaceFolder, relativePath, expected) => {
    expect(resolveWorkspaceFilePath(workspaceFolder, relativePath)).toBe(
      expected,
    )
  },
)

test.each([
  ['', 'file.txt', 'No workspace folder is currently open.'],
  ['/workspace', '', 'Workspace file path is required.'],
  ['/workspace', '.', 'Workspace file path is required.'],
  ['/workspace', '/tmp/file.txt', 'Workspace file path must be relative.'],
  ['/workspace', '\\tmp\\file.txt', 'Workspace file path must be relative.'],
  ['/workspace', 'C:\\tmp\\file.txt', 'Workspace file path must be relative.'],
  [
    '/workspace',
    'file:///tmp/file.txt',
    'Workspace file path must be relative.',
  ],
  [
    '/workspace',
    '../outside.txt',
    'Workspace file path cannot leave the opened workspace.',
  ],
  [
    '/workspace',
    'src\\..\\..\\outside.txt',
    'Workspace file path cannot leave the opened workspace.',
  ],
])(
  'resolveWorkspaceFilePath - rejects unsafe path %#',
  (workspaceFolder, relativePath, message) => {
    expect(() =>
      resolveWorkspaceFilePath(workspaceFolder, relativePath),
    ).toThrow(message)
  },
)

test('readWorkspaceFile - reads resolved workspace file', async () => {
  const api = createApi()

  await expect(readWorkspaceFile('src/index.ts', api)).resolves.toEqual({
    content: 'file content',
    path: 'src/index.ts',
  })
  expect(api.readFile).toHaveBeenCalledWith('/workspace/src/index.ts')
})

test('writeWorkspaceFile - writes resolved workspace file', async () => {
  const api = createApi()

  await expect(
    writeWorkspaceFile('src/index.ts', 'new content', api),
  ).resolves.toEqual({
    path: 'src/index.ts',
    written: true,
  })
  expect(api.writeFile).toHaveBeenCalledWith(
    '/workspace/src/index.ts',
    'new content',
  )
})
