import * as Rpc from '../Rpc/Rpc.ts'

interface FileSystemDirent {
  readonly name: string
  readonly type: number
}

export interface WorkspaceFileSystemApi {
  readonly getWorkspaceFolder: () => Promise<string>
  readonly readDirWithFileTypes: (
    uri: string,
  ) => Promise<readonly FileSystemDirent[]>
  readonly readFile: (uri: string) => Promise<string>
  readonly writeFile: (uri: string, content: string) => Promise<void>
}

const defaultApi: WorkspaceFileSystemApi = {
  getWorkspaceFolder: () =>
    Rpc.invoke<string>('WorkspaceFileSystem.getWorkspaceFolder'),
  readDirWithFileTypes: (uri) =>
    Rpc.invoke<readonly FileSystemDirent[]>(
      'WorkspaceFileSystem.readDirWithFileTypes',
      uri,
    ),
  readFile: (uri) => Rpc.invoke<string>('WorkspaceFileSystem.readFile', uri),
  writeFile: (uri, content) =>
    Rpc.invoke<void>('WorkspaceFileSystem.writeFile', uri, content),
}

const uriSchemeRegex = /^[A-Za-z][A-Za-z\d+.-]*:/
const windowsAbsolutePathRegex = /^[A-Za-z]:[\\/]/
const pathSeparatorRegex = /[\\/]+/

const trimTrailingPathSeparators = (value: string): string => {
  let end = value.length
  while (end > 0 && (value[end - 1] === '/' || value[end - 1] === '\\')) {
    end--
  }
  return value.slice(0, end)
}

const getPathSegments = (
  relativePath: string,
  pathKind: 'directory' | 'file',
  allowWorkspaceRoot = false,
): readonly string[] => {
  const trimmedPath = relativePath.trim()
  if (!trimmedPath) {
    throw new Error(`Workspace ${pathKind} path is required.`)
  }
  if (
    trimmedPath.startsWith('/') ||
    trimmedPath.startsWith('\\') ||
    uriSchemeRegex.test(trimmedPath) ||
    windowsAbsolutePathRegex.test(trimmedPath)
  ) {
    throw new Error(`Workspace ${pathKind} path must be relative.`)
  }
  const segments = trimmedPath
    .split(pathSeparatorRegex)
    .filter((segment) => segment && segment !== '.')
  if (segments.includes('..')) {
    throw new Error(
      `Workspace ${pathKind} path cannot leave the opened workspace.`,
    )
  }
  if (segments.length === 0 && !allowWorkspaceRoot) {
    throw new Error(`Workspace ${pathKind} path is required.`)
  }
  return segments
}

const resolveWorkspacePath = (
  workspaceFolder: string,
  relativePath: string,
  pathKind: 'directory' | 'file',
  allowWorkspaceRoot = false,
): string => {
  if (!workspaceFolder) {
    throw new Error('No workspace folder is currently open.')
  }
  const segments = getPathSegments(relativePath, pathKind, allowWorkspaceRoot)
  if (segments.length === 0) {
    return workspaceFolder
  }
  const pathSeparator =
    workspaceFolder.includes('\\') && !workspaceFolder.includes('/')
      ? '\\'
      : '/'
  const workspaceRoot = trimTrailingPathSeparators(workspaceFolder)
  return `${workspaceRoot}${pathSeparator}${segments.join(pathSeparator)}`
}

export const resolveWorkspaceFilePath = (
  workspaceFolder: string,
  relativePath: string,
): string => {
  return resolveWorkspacePath(workspaceFolder, relativePath, 'file')
}

export const resolveWorkspaceDirectoryPath = (
  workspaceFolder: string,
  relativePath: string,
): string => {
  return resolveWorkspacePath(workspaceFolder, relativePath, 'directory', true)
}

type WorkspaceDirectoryEntryType =
  | 'block-device'
  | 'character-device'
  | 'directory'
  | 'fifo'
  | 'file'
  | 'socket'
  | 'symbolic-link'
  | 'unknown'

interface WorkspaceDirectoryEntry {
  readonly name: string
  readonly type: WorkspaceDirectoryEntryType
}

const getDirectoryEntryType = (type: number): WorkspaceDirectoryEntryType => {
  switch (type) {
    case 1:
      return 'block-device'
    case 10:
      return 'file'
    case 11:
      return 'directory'
    case 2:
      return 'character-device'
    case 3:
    case 4:
    case 5:
      return 'directory'
    case 6:
      return 'fifo'
    case 7:
      return 'file'
    case 8:
      return 'socket'
    case 9:
      return 'symbolic-link'
    default:
      return 'unknown'
  }
}

export const listWorkspaceDirectory = async (
  relativePath: string,
  api: WorkspaceFileSystemApi = defaultApi,
): Promise<
  Readonly<{
    entries: readonly WorkspaceDirectoryEntry[]
    path: string
  }>
> => {
  const workspaceFolder = await api.getWorkspaceFolder()
  const absolutePath = resolveWorkspaceDirectoryPath(
    workspaceFolder,
    relativePath,
  )
  const dirents = await api.readDirWithFileTypes(absolutePath)
  const entries = dirents
    .map<WorkspaceDirectoryEntry>((dirent) => ({
      name: dirent.name,
      type: getDirectoryEntryType(dirent.type),
    }))
    .toSorted((a, b) => a.name.localeCompare(b.name))
  return {
    entries,
    path: relativePath,
  }
}

export const readWorkspaceFile = async (
  relativePath: string,
  api: WorkspaceFileSystemApi = defaultApi,
): Promise<Readonly<{ content: string; path: string }>> => {
  const workspaceFolder = await api.getWorkspaceFolder()
  const absolutePath = resolveWorkspaceFilePath(workspaceFolder, relativePath)
  const content = await api.readFile(absolutePath)
  return {
    content,
    path: relativePath,
  }
}

export const writeWorkspaceFile = async (
  relativePath: string,
  content: string,
  api: WorkspaceFileSystemApi = defaultApi,
): Promise<Readonly<{ path: string; written: boolean }>> => {
  const workspaceFolder = await api.getWorkspaceFolder()
  const absolutePath = resolveWorkspaceFilePath(workspaceFolder, relativePath)
  await api.writeFile(absolutePath, content)
  return {
    path: relativePath,
    written: true,
  }
}
