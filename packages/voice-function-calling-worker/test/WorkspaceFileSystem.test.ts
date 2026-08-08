import { expect, jest, test } from '@jest/globals'
import {
  listWorkspaceDirectory,
  readWorkspaceFile,
  resolveWorkspaceDirectoryPath,
  resolveWorkspaceFilePath,
  type WorkspaceFileSystemApi,
  writeWorkspaceFile,
} from '../src/parts/WorkspaceFileSystem/WorkspaceFileSystem.ts'

const createApi = (workspaceFolder = '/workspace'): WorkspaceFileSystemApi => ({
  getWorkspaceFolder: jest.fn(async () => workspaceFolder),
  readDirWithFileTypes: jest.fn(async () => [
    { name: 'src', type: 3 },
    { name: 'package.json', type: 7 },
  ]),
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
  ['/workspace', '.', '/workspace'],
  ['/workspace/', 'src', '/workspace/src'],
  ['C:\\workspace', '.', 'C:\\workspace'],
  ['C:\\workspace', 'src/lib', 'C:\\workspace\\src\\lib'],
])(
  'resolveWorkspaceDirectoryPath - resolves %s and %s',
  (workspaceFolder, relativePath, expected) => {
    expect(resolveWorkspaceDirectoryPath(workspaceFolder, relativePath)).toBe(
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

test.each([
  ['/workspace', '', 'Workspace directory path is required.'],
  ['/workspace', '/tmp', 'Workspace directory path must be relative.'],
  [
    '/workspace',
    '../outside',
    'Workspace directory path cannot leave the opened workspace.',
  ],
])(
  'resolveWorkspaceDirectoryPath - rejects unsafe path %#',
  (workspaceFolder, relativePath, message) => {
    expect(() =>
      resolveWorkspaceDirectoryPath(workspaceFolder, relativePath),
    ).toThrow(message)
  },
)

test('listWorkspaceDirectory - lists sorted workspace entries', async () => {
  const api = createApi()

  await expect(listWorkspaceDirectory('.', api)).resolves.toEqual({
    entries: [
      { name: 'package.json', type: 'file' },
      { name: 'src', type: 'directory' },
    ],
    path: '.',
  })
  expect(api.readDirWithFileTypes).toHaveBeenCalledWith('/workspace')
})

test.each([
  [1, 'block-device'],
  [2, 'character-device'],
  [4, 'directory'],
  [5, 'directory'],
  [6, 'fifo'],
  [8, 'socket'],
  [9, 'symbolic-link'],
  [10, 'file'],
  [11, 'directory'],
  [12, 'unknown'],
])(
  'listWorkspaceDirectory - maps file type %s to %s',
  async (type, expected) => {
    const api = createApi()
    jest
      .mocked(api.readDirWithFileTypes)
      .mockResolvedValue([{ name: 'entry', type }])

    await expect(listWorkspaceDirectory('src', api)).resolves.toEqual({
      entries: [{ name: 'entry', type: expected }],
      path: 'src',
    })
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
