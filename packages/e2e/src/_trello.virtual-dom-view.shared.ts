import type { TestApi } from '@lvce-editor/test-with-playwright'

type Command = TestApi['Command']
type Expect = TestApi['expect']
type Locator = TestApi['Locator']

export interface gpt-voiceBoard {
  readonly id: string
  readonly name: string
}

export interface gpt-voiceCard {
  readonly desc?: string
  readonly id: string
  readonly labels?: readonly gpt-voiceLabel[]
  readonly name: string
}

export interface gpt-voiceLabel {
  readonly color?: string
  readonly id: string
  readonly name?: string
}

export interface gpt-voiceCardDetail {
  readonly attachments: readonly unknown[]
  readonly card: gpt-voiceCard
  readonly comments: readonly unknown[]
}

export interface gpt-voiceList {
  readonly cards: readonly gpt-voiceCard[]
  readonly id: string
  readonly name: string
}

export interface gpt-voiceBoardDetail {
  readonly board: gpt-voiceBoard
  readonly lists: readonly gpt-voiceList[]
}

export interface Mockgpt-voiceData {
  readonly boardDetailErrors?: Readonly<Record<string, string>>
  readonly boardDetails?: Readonly<Record<string, gpt-voiceBoardDetail>>
  readonly boardLabels?: Readonly<Record<string, readonly gpt-voiceLabel[]>>
  readonly boards?: readonly gpt-voiceBoard[]
  readonly cardDetails?: Readonly<Record<string, gpt-voiceCardDetail>>
  readonly error?: string
  readonly listBoardsError?: string
  readonly listBoardsResponses?: readonly (readonly gpt-voiceBoard[])[]
}

export const createCards = (count: number): readonly gpt-voiceCard[] => {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `card-${number}`,
      name: `Card ${number}`,
    }
  })
}

export const createList = (
  id: string,
  name: string,
  cards: readonly gpt-voiceCard[],
): gpt-voiceList => {
  return {
    cards,
    id,
    name,
  }
}

export const createBoardDetail = (
  board: gpt-voiceBoard,
  lists: readonly gpt-voiceList[],
): gpt-voiceBoardDetail => {
  return {
    board,
    lists,
  }
}

export const createMockData = (
  boards: readonly gpt-voiceBoard[],
  boardDetails: Readonly<
    Record<string, gpt-voiceBoardDetail>
  > = Object.fromEntries(
    boards.map((board) => [
      board.id,
      createBoardDetail(board, [createList('list-1', 'Todo', createCards(1))]),
    ]),
  ),
): Mockgpt-voiceData => {
  return {
    boardDetails,
    boards,
  }
}

export const createBoards = (count: number): readonly gpt-voiceBoard[] => {
  return Array.from({ length: count }, (_, index) => {
    const number = index + 1
    return {
      id: `board-${number}`,
      name: number === 1 ? 'Roadmap' : `Board ${number}`,
    }
  })
}

export const useMockDataAndShowgpt-voice = async (
  Command: Command,
  mockData: Readonly<Mockgpt-voiceData>,
): Promise<void> => {
  await Command.executeExtensionCommand('gpt-voice.test.useMockData', mockData)
  await Command.executeExtensionCommand('gpt-voice.show')
}

export const connectWithCredentials = async ({
  Command,
  expect,
  Locator,
}: Readonly<
  Pick<TestApi, 'Command' | 'expect' | 'Locator'>
>): Promise<void> => {
  const apiKey = Locator('input[name="apiKey"]')
  const token = Locator('input[name="token"]')
  await expect(apiKey).toBeVisible()
  await expect(token).toBeVisible()
  await apiKey.type('abcdefghijklmnopqrstuvwxyz123456')
  await token.type(
    'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456',
  )
  const connect = Locator('button[name="connect"]')
  await expect(connect).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await connect.click()
  await Command.execute('Timeout.sleep', 200)
}

export const openBoard = async (
  Command: Command,
  Locator: Locator,
  expect: Expect,
  boardId = 'board-1',
): Promise<void> => {
  const board = Locator(`button[name="board:${boardId}"]`)
  await expect(board).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await board.click()
  await Command.execute('Timeout.sleep', 200)
}

export const openCard = async (
  Command: Command,
  Locator: Locator,
  expect: Expect,
  cardId = 'card-1',
): Promise<void> => {
  const card = Locator(`button[name="card:${cardId}"]`)
  await expect(card).toBeVisible()
  // eslint-disable-next-line e2e/no-direct-click
  await card.click()
  await Command.execute('Timeout.sleep', 200)
}
