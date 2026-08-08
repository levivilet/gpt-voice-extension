import { getWorkspaceFolder, readFile, writeFile } from '@lvce-editor/api'

export interface WorkspaceFileSystemApi {
  readonly getWorkspaceFolder: () => Promise<string>
  readonly readFile: (uri: string) => Promise<string>
  readonly writeFile: (uri: string, content: string) => Promise<void>
}

const defaultApi: WorkspaceFileSystemApi = {
  getWorkspaceFolder,
  readFile,
  writeFile,
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

const getPathSegments = (relativePath: string): readonly string[] => {
  const trimmedPath = relativePath.trim()
  if (!trimmedPath) {
    throw new Error('Workspace file path is required.')
  }
  if (
    trimmedPath.startsWith('/') ||
    trimmedPath.startsWith('\\') ||
    uriSchemeRegex.test(trimmedPath) ||
    windowsAbsolutePathRegex.test(trimmedPath)
  ) {
    throw new Error('Workspace file path must be relative.')
  }
  const segments = trimmedPath
    .split(pathSeparatorRegex)
    .filter((segment) => segment && segment !== '.')
  if (segments.includes('..')) {
    throw new Error('Workspace file path cannot leave the opened workspace.')
  }
  if (segments.length === 0) {
    throw new Error('Workspace file path is required.')
  }
  return segments
}

export const resolveWorkspaceFilePath = (
  workspaceFolder: string,
  relativePath: string,
): string => {
  if (!workspaceFolder) {
    throw new Error('No workspace folder is currently open.')
  }
  const pathSeparator =
    workspaceFolder.includes('\\') && !workspaceFolder.includes('/')
      ? '\\'
      : '/'
  const workspaceRoot = trimTrailingPathSeparators(workspaceFolder)
  return `${workspaceRoot}${pathSeparator}${getPathSegments(relativePath).join(pathSeparator)}`
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
