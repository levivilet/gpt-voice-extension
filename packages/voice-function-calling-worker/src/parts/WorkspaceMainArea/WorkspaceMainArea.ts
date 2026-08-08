import * as Rpc from '../Rpc/Rpc.ts'
import { resolveWorkspaceFilePath } from '../WorkspaceFileSystem/WorkspaceFileSystem.ts'

export interface WorkspaceMainAreaApi {
  readonly closeUri: (uri: string) => Promise<void>
  readonly getWorkspaceUri: () => Promise<string>
  readonly openUri: (uri: string) => Promise<void>
}

const defaultApi: WorkspaceMainAreaApi = {
  closeUri: (uri) => Rpc.invoke<void>('WorkspaceMainArea.closeUri', uri),
  getWorkspaceUri: () =>
    Rpc.invoke<string>('WorkspaceMainArea.getWorkspaceUri'),
  openUri: (uri) => Rpc.invoke<void>('WorkspaceMainArea.openUri', uri),
}

export const closeWorkspaceFile = async (
  relativePath: string,
  api: WorkspaceMainAreaApi = defaultApi,
): Promise<Readonly<{ closed: boolean; path: string }>> => {
  const workspaceUri = await api.getWorkspaceUri()
  const uri = resolveWorkspaceFilePath(workspaceUri, relativePath)
  await api.closeUri(uri)
  return {
    closed: true,
    path: relativePath,
  }
}

export const openWorkspaceFile = async (
  relativePath: string,
  api: WorkspaceMainAreaApi = defaultApi,
): Promise<Readonly<{ opened: boolean; path: string }>> => {
  const workspaceUri = await api.getWorkspaceUri()
  const uri = resolveWorkspaceFilePath(workspaceUri, relativePath)
  await api.openUri(uri)
  return {
    opened: true,
    path: relativePath,
  }
}
