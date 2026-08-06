import type { RecentBoardView } from '../RecentBoardStorage/RecentBoardStorage.ts'
import type { gpt-voiceBoard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export interface WorkspaceSection {
  readonly boards: readonly gpt-voiceBoard[]
  readonly name: string
}

export const parseDate = (value: string | undefined): number => {
  if (!value) {
    return 0
  }
  const time = Date.parse(value)
  if (Number.isNaN(time)) {
    return 0
  }
  return time
}

export const getLocalViewedAt = (
  recentBoardViews: readonly RecentBoardView[],
  boardId: string,
): number => {
  const recentBoardView = recentBoardViews.find((item) => {
    return item.boardId === boardId
  })
  return parseDate(recentBoardView?.viewedAt)
}

export const getBoardViewedAt = (
  state: Readonly<gpt-voiceViewState>,
  board: gpt-voiceBoard,
): number => {
  return Math.max(
    parseDate(board.dateLastView),
    getLocalViewedAt(state.recentBoardViews, board.id),
  )
}

export const sortBoardsByViewedAt = (
  state: Readonly<gpt-voiceViewState>,
  boards: readonly gpt-voiceBoard[],
): readonly gpt-voiceBoard[] => {
  const originalIndexes = new Map(
    state.boards.map((board, index) => [board.id, index]),
  )
  return boards.toSorted((a, b) => {
    const viewedAtDiff = getBoardViewedAt(state, b) - getBoardViewedAt(state, a)
    if (viewedAtDiff !== 0) {
      return viewedAtDiff
    }
    return (originalIndexes.get(a.id) ?? 0) - (originalIndexes.get(b.id) ?? 0)
  })
}

export const getRecentlyViewedBoards = (
  state: Readonly<gpt-voiceViewState>,
): readonly gpt-voiceBoard[] => {
  return sortBoardsByViewedAt(state, state.boards)
    .filter((board) => getBoardViewedAt(state, board) > 0)
    .slice(0, 4)
}

export const getWorkspaceName = (board: gpt-voiceBoard): string => {
  return (
    board.organization?.displayName ||
    board.organization?.name ||
    gpt-voiceStrings.personalBoards()
  )
}

export const getWorkspaceSections = (
  state: Readonly<gpt-voiceViewState>,
): readonly WorkspaceSection[] => {
  const sections = new Map<string, gpt-voiceBoard[]>()
  for (const board of state.boards) {
    const name = getWorkspaceName(board)
    const boards = sections.get(name) || []
    boards.push(board)
    sections.set(name, boards)
  }
  return Array.from(
    sections,
    (entry: readonly [string, readonly gpt-voiceBoard[]]): WorkspaceSection => {
      const [name, boards] = entry
      return {
        boards: sortBoardsByViewedAt(state, boards),
        name,
      }
    },
  )
}
