import * as Rpc from '../Rpc/Rpc.ts'

interface FileSystemDirent {
  readonly name: string
  readonly type: number
}

export interface WorkspaceFileSystemApi {
  readonly getWorkspaceUri: () => Promise<string>
  readonly readDirWithFileTypes: (
    uri: string,
  ) => Promise<readonly FileSystemDirent[]>
  readonly readFile: (uri: string) => Promise<string>
  readonly writeFile: (uri: string, content: string) => Promise<void>
}

const defaultApi: WorkspaceFileSystemApi = {
  getWorkspaceUri: () =>
    Rpc.invoke<string>('WorkspaceFileSystem.getWorkspaceUri'),
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

const resolveWorkspaceUri = (
  workspaceUri: string,
  relativePath: string,
  pathKind: 'directory' | 'file',
  allowWorkspaceRoot = false,
): string => {
  if (!workspaceUri) {
    throw new Error('No workspace folder is currently open.')
  }
  if (!uriSchemeRegex.test(workspaceUri)) {
    throw new Error(
      'The opened workspace does not provide a valid filesystem URI.',
    )
  }
  const segments = getPathSegments(relativePath, pathKind, allowWorkspaceRoot)
  if (segments.length === 0) {
    return workspaceUri
  }
  const workspaceRoot = workspaceUri.endsWith('/')
    ? workspaceUri
    : `${workspaceUri}/`
  try {
    return new URL(
      segments.map((segment) => encodeURIComponent(segment)).join('/'),
      workspaceRoot,
    ).href
  } catch {
    throw new Error(
      'The opened workspace does not provide a valid filesystem URI.',
    )
  }
}

export const resolveWorkspaceFileUri = (
  workspaceUri: string,
  relativePath: string,
): string => {
  return resolveWorkspaceUri(workspaceUri, relativePath, 'file')
}

export const resolveWorkspaceDirectoryUri = (
  workspaceUri: string,
  relativePath: string,
): string => {
  return resolveWorkspaceUri(workspaceUri, relativePath, 'directory', true)
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

const getErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error)
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
  const workspaceUri = await api.getWorkspaceUri()
  const directoryUri = resolveWorkspaceDirectoryUri(workspaceUri, relativePath)
  let dirents: readonly FileSystemDirent[]
  try {
    dirents = await api.readDirWithFileTypes(directoryUri)
  } catch (error) {
    throw new Error(
      `Failed to list workspace directory "${relativePath}": ${getErrorMessage(error)}`,
    )
  }
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
  const workspaceUri = await api.getWorkspaceUri()
  const fileUri = resolveWorkspaceFileUri(workspaceUri, relativePath)
  let content: string
  try {
    content = await api.readFile(fileUri)
  } catch (error) {
    throw new Error(
      `Failed to read workspace file "${relativePath}": ${getErrorMessage(error)}`,
    )
  }
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
  const workspaceUri = await api.getWorkspaceUri()
  const fileUri = resolveWorkspaceFileUri(workspaceUri, relativePath)
  try {
    await api.writeFile(fileUri, content)
  } catch (error) {
    throw new Error(
      `Failed to write workspace file "${relativePath}": ${getErrorMessage(error)}`,
    )
  }
  return {
    path: relativePath,
    written: true,
  }
}
