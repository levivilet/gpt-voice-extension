// cspell:ignore prefs

import type {
  ViewEvent,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import { expect, test } from '@jest/globals'
import { AriaRoles, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { Activegpt-voiceViewInstance } from '../src/parts/CreateInstance/CreateInstance.ts'
import type { gpt-voiceClient } from '../src/parts/gpt-voiceClient/gpt-voiceClient.ts'
import type { gpt-voiceImageCache } from '../src/parts/gpt-voiceImageCache/gpt-voiceImageCache.ts'
import type {
  gpt-voiceAttachment,
  gpt-voiceBoard,
  gpt-voiceBoardDetail,
  gpt-voiceCard,
  gpt-voiceCardDetail,
  gpt-voiceCardMove,
  gpt-voiceCardUpdate,
  gpt-voiceComment,
  gpt-voiceCredentials,
  gpt-voiceLabel,
  gpt-voiceSearchResult,
  gpt-voiceList,
  gpt-voiceListCreate,
  gpt-voiceListUpdate,
} from '../src/parts/gpt-voiceTypes/gpt-voiceTypes.ts'
import { createMemoryCredentialStorage } from '../src/parts/CredentialStorage/CredentialStorage.ts'
import { createMemoryCurrentBoardStorage } from '../src/parts/CurrentBoardStorage/CurrentBoardStorage.ts'
import { createMockgpt-voiceClient } from '../src/parts/Mockgpt-voiceClient/Mockgpt-voiceClient.ts'
import {
  createMemoryRecentBoardStorage,
  type RecentBoardView,
} from '../src/parts/RecentBoardStorage/RecentBoardStorage.ts'
import {
  backToBoardsActivegpt-voiceViewInstance,
  cancelNewCardActivegpt-voiceViewInstance,
  closeCardDetailActivegpt-voiceViewInstance,
  reloadActivegpt-voiceViewInstances,
  resetgpt-voiceViewDependencyFactory,
  saveCardDetailActivegpt-voiceViewInstance,
  setgpt-voiceViewDependencyFactory,
  submitNewCardActivegpt-voiceViewInstance,
  view,
} from '../src/parts/gpt-voiceView/gpt-voiceView.ts'

const validApiKey = 'abcdefghijklmnopqrstuvwxyz123456'
const validToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456'
const validLongToken =
  'abcdefghijklmnopqrstuvwxyz123456abcdefghijklmnopqrstuvwxyz123456abcdefghijkl'

const getExpectedAssetBaseUrl = (): string => {
  const url = new URL('../', import.meta.url)
  return `/remote${url.pathname}`
}

const createMockgpt-voiceImageCache = (
  urls: Readonly<Record<string, string>> = {},
): gpt-voiceImageCache => {
  return {
    dispose(): void {},
    async resolveImageUrl(url: string): Promise<string> {
      return urls[url] || ''
    },
  }
}

type ContextMenuViewEvent = ViewEvent & {
  readonly x: number
  readonly y: number
}

const createContextMenuEvent = (
  name: string,
  x: number,
  y: number,
): ContextMenuViewEvent => {
  return {
    name,
    type: 'contextmenu',
    x,
    y,
  }
}

const getText = (dom: readonly any[]): string => {
  return dom
    .filter((node) => typeof node.text === 'string')
    .map((node) => node.text)
    .join('\n')
}

const getClassNames = (dom: readonly any[]): readonly string[] => {
  return dom
    .map((node) => node.className)
    .filter((className): className is string => typeof className === 'string')
}

const getNodeEndIndex = (dom: readonly any[], index: number): number => {
  let nextIndex = index + 1
  const childCount = dom[index]?.childCount || 0
  for (let i = 0; i < childCount; i++) {
    nextIndex = getNodeEndIndex(dom, nextIndex)
  }
  return nextIndex
}

const hasDirectChildClass = (
  dom: readonly any[],
  parentClassName: string,
  childClassName: string,
): boolean => {
  for (let i = 0; i < dom.length; i++) {
    if (dom[i].className !== parentClassName) {
      continue
    }
    let childIndex = i + 1
    const childCount = dom[i].childCount || 0
    for (let j = 0; j < childCount; j++) {
      if (dom[childIndex]?.className === childClassName) {
        return true
      }
      childIndex = getNodeEndIndex(dom, childIndex)
    }
  }
  return false
}

const getDirectChildClassNamesByName = (
  dom: readonly any[],
  name: string,
): readonly string[] => {
  const index = dom.findIndex((node) => {
    return node.name === name
  })
  if (index === -1) {
    return []
  }
  const classNames: string[] = []
  let childIndex = index + 1
  const childCount = dom[index]?.childCount || 0
  for (let i = 0; i < childCount; i++) {
    const className = dom[childIndex]?.className
    if (typeof className === 'string') {
      classNames.push(className)
    }
    childIndex = getNodeEndIndex(dom, childIndex)
  }
  return classNames
}

const getDirectChildClassNamesByClassName = (
  dom: readonly any[],
  parentClassName: string,
): readonly string[] => {
  const index = dom.findIndex((node) => {
    return node.className === parentClassName
  })
  if (index === -1) {
    return []
  }
  const classNames: string[] = []
  let childIndex = index + 1
  const childCount = dom[index]?.childCount || 0
  for (let i = 0; i < childCount; i++) {
    const className = dom[childIndex]?.className
    if (typeof className === 'string') {
      classNames.push(className)
    }
    childIndex = getNodeEndIndex(dom, childIndex)
  }
  return classNames
}

const hasNode = (
  dom: readonly any[],
  predicate: (node: any) => boolean,
): boolean => {
  return dom.some(predicate)
}

const hasLabelText = (dom: readonly any[], text: string): boolean => {
  return dom.some((node, index) => {
    return (
      node.type === VirtualDomElements.Label && dom[index + 1]?.text === text
    )
  })
}

const hasClass = (node: any, className: string): boolean => {
  if (typeof node.className !== 'string') {
    return false
  }
  return node.className.split(' ').includes(className)
}

const getNodeByClass = (dom: readonly any[], className: string): any => {
  return dom.find((node) => hasClass(node, className))
}

const getListTitleInput = (dom: readonly any[], listId: string): any => {
  return dom.find((node) => {
    return node.name === `listTitle:${listId}`
  })
}

const getNodeByName = (dom: readonly any[], name: string): any => {
  return dom.find((node) => {
    return node.name === name
  })
}

const getSubtreeTextByNodeName = (
  dom: readonly any[],
  name: string,
): string => {
  return getText(getSubtreeByNodeName(dom, name))
}

const getSubtreeByNodeName = (
  dom: readonly any[],
  name: string,
): readonly any[] => {
  const index = dom.findIndex((node) => {
    return node.name === name
  })
  if (index === -1) {
    return []
  }
  const endIndex = getNodeEndIndex(dom, index)
  return dom.slice(index, endIndex)
}

const getBoardButtonLabels = (dom: readonly any[]): readonly string[] => {
  const labels: string[] = []
  for (let i = 0; i < dom.length; i++) {
    const node = dom[i]
    if (typeof node.name === 'string' && node.name.startsWith('board:')) {
      labels.push(dom[i + 1]?.text || '')
    }
  }
  return labels
}

const createAuthenticatedInstance = async (
  boards: readonly gpt-voiceBoard[],
  recentBoardViews: readonly RecentBoardView[] = [],
  options: {
    readonly boardBackgroundEnabled?: boolean
    readonly boardDetails?: Readonly<Record<string, gpt-voiceBoardDetail>>
    readonly boardLabels?: Readonly<Record<string, readonly gpt-voiceLabel[]>>
    readonly cardDetailPopupEnabled?: boolean
    readonly cardCreateErrors?: Readonly<Record<string, string>>
    readonly cardDetails?: Readonly<Record<string, gpt-voiceCardDetail>>
    readonly cardLabelAddErrors?: Readonly<Record<string, string>>
    readonly cardMoveErrors?: Readonly<Record<string, string>>
    readonly client?: gpt-voiceClient
    readonly imageCache?: gpt-voiceImageCache
    readonly listUpdateErrors?: Readonly<Record<string, string>>
    readonly showContextMenu?: (
      menuId: string,
      x: number,
      y: number,
    ) => Promise<void>
  } = {},
): Promise<Activegpt-voiceViewInstance> => {
  const {
    boardDetails,
    boardLabels,
    cardCreateErrors,
    cardDetails,
    cardLabelAddErrors,
    cardMoveErrors,
    imageCache,
    listUpdateErrors,
  } = options
  setgpt-voiceViewDependencyFactory(() => ({
    client:
      options.client ||
      createMockgpt-voiceClient({
        boards,
        ...(boardDetails && { boardDetails }),
        ...(boardLabels && { boardLabels }),
        ...(cardCreateErrors && { cardCreateErrors }),
        ...(cardDetails && { cardDetails }),
        ...(cardLabelAddErrors && { cardLabelAddErrors }),
        ...(cardMoveErrors && { cardMoveErrors }),
        ...(listUpdateErrors && { listUpdateErrors }),
      }),
    ...(imageCache && { imageCache }),
    readBoardBackgroundEnabled: async (): Promise<boolean> => {
      return options.boardBackgroundEnabled === true
    },
    readCardDetailPopupEnabled: async (): Promise<boolean> => {
      return options.cardDetailPopupEnabled === true
    },
    recentStorage: createMemoryRecentBoardStorage(recentBoardViews),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = await view.create(
    options.showContextMenu
      ? ({
          showContextMenu: options.showContextMenu,
        } as any)
      : undefined,
  )
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  return instance
}

interface SearchInstanceData {
  readonly boardDetails?: Readonly<Record<string, gpt-voiceBoardDetail>>
  readonly boards?: readonly gpt-voiceBoard[]
  readonly cardDetails?: Readonly<Record<string, gpt-voiceCardDetail>>
  readonly searchError?: string
  readonly searchResults?: readonly gpt-voiceSearchResult[]
}

const createSearchEnabledInstance = async (
  data: Readonly<SearchInstanceData>,
  options: {
    readonly boardBackgroundEnabled?: boolean
  } = {},
): Promise<Activegpt-voiceViewInstance> => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient(data),
    readBoardBackgroundEnabled: async (): Promise<boolean> => {
      return options.boardBackgroundEnabled === true
    },
    readSearchEnabled: async (): Promise<boolean> => true,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = await view.create()
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  return instance
}

const createDeferred = <T>(): PromiseWithResolvers<T> => {
  return Promise.withResolvers<T>()
}

const waitForCoverImages = async (): Promise<void> => {
  await Promise.resolve()
  await Promise.resolve()
}

const getFreshAttachments = async (
  fresh: Readonly<Promise<gpt-voiceCardDetail>>,
): Promise<gpt-voiceCardDetail['attachments']> => {
  const detail = await fresh
  return detail.attachments
}

const getFreshCard = async (
  fresh: Readonly<Promise<gpt-voiceCardDetail>>,
): Promise<gpt-voiceCard> => {
  const detail = await fresh
  return detail.card
}

const getFreshComments = async (
  fresh: Readonly<Promise<gpt-voiceCardDetail>>,
): Promise<gpt-voiceCardDetail['comments']> => {
  const detail = await fresh
  return detail.comments
}

const createStagedCardClient = (options: {
  readonly boardDetail: gpt-voiceBoardDetail
  readonly boards: readonly gpt-voiceBoard[]
  readonly getCardDetailPartsCacheFirst: gpt-voiceClient['getCardDetailPartsCacheFirst']
}): gpt-voiceClient => {
  return {
    async addCardAttachment(
      _card: Readonly<gpt-voiceCard>,
      file: File,
    ): Promise<gpt-voiceAttachment> {
      return {
        id: 'created-attachment-1',
        mimeType: file.type,
        name: file.name,
      }
    },
    async addCardComment(
      _card: Readonly<gpt-voiceCard>,
      text: string,
    ): Promise<gpt-voiceComment> {
      return {
        data: { text },
        id: 'created-comment-1',
      }
    },
    async addCardLabel(card: Readonly<gpt-voiceCard>): Promise<gpt-voiceCard> {
      return card
    },
    async createCard(list: Readonly<gpt-voiceList>): Promise<gpt-voiceCard> {
      return {
        id: 'created-card-1',
        idList: list.id,
        name: 'Created card',
      }
    },
    async createLabel(board, create): Promise<gpt-voiceLabel> {
      return {
        color: create.color,
        id: 'created-label-1',
        idBoard: board.id,
        name: create.name,
      }
    },
    async createList(
      _board: Readonly<gpt-voiceBoard>,
      create: Readonly<gpt-voiceListCreate>,
    ): Promise<gpt-voiceList> {
      return {
        cards: [],
        id: 'created-list-1',
        name: create.name,
      }
    },
    async getBoardDetail(): Promise<gpt-voiceBoardDetail> {
      return options.boardDetail
    },
    async getBoardDetailCacheFirst(): ReturnType<
      gpt-voiceClient['getBoardDetailCacheFirst']
    > {
      return {
        cached: undefined,
        fresh: Promise.resolve(options.boardDetail),
      }
    },
    async getCardDetail(
      card: Readonly<gpt-voiceCard>,
      credentials: Readonly<gpt-voiceCredentials>,
    ): Promise<gpt-voiceCardDetail> {
      const result = await options.getCardDetailPartsCacheFirst(
        card,
        credentials,
      )
      const [detailCard, attachments, comments] = await Promise.all([
        result.fresh.card,
        result.fresh.attachments,
        result.fresh.comments,
      ])
      return {
        attachments,
        card: detailCard,
        comments,
      }
    },
    async getCardDetailCacheFirst(
      card: Readonly<gpt-voiceCard>,
      credentials: Readonly<gpt-voiceCredentials>,
    ): ReturnType<gpt-voiceClient['getCardDetailCacheFirst']> {
      const result = await options.getCardDetailPartsCacheFirst(
        card,
        credentials,
      )
      const fresh = async (): Promise<gpt-voiceCardDetail> => {
        const [detailCard, attachments, comments] = await Promise.all([
          result.fresh.card,
          result.fresh.attachments,
          result.fresh.comments,
        ])
        return {
          attachments,
          card: detailCard,
          comments,
        }
      }
      return {
        cached: result.cached,
        fresh: fresh(),
      }
    },
    getCardDetailPartsCacheFirst: options.getCardDetailPartsCacheFirst,
    async listBoardLabels(): Promise<readonly gpt-voiceLabel[]> {
      return []
    },
    async listBoards(): Promise<readonly gpt-voiceBoard[]> {
      return options.boards
    },
    async listBoardsCacheFirst(): ReturnType<
      gpt-voiceClient['listBoardsCacheFirst']
    > {
      return {
        cached: undefined,
        fresh: Promise.resolve(options.boards),
      }
    },
    async moveCard(
      card: Readonly<gpt-voiceCard>,
      move: Readonly<gpt-voiceCardMove>,
    ): Promise<gpt-voiceCard> {
      return {
        ...card,
        idList: move.idList,
      }
    },
    async search(): Promise<readonly gpt-voiceSearchResult[]> {
      return []
    },
    async searchCacheFirst(): ReturnType<gpt-voiceClient['searchCacheFirst']> {
      return {
        cached: undefined,
        fresh: Promise.resolve([]),
      }
    },
    async updateCard(
      card: Readonly<gpt-voiceCard>,
      update: Readonly<gpt-voiceCardUpdate>,
    ): Promise<gpt-voiceCard> {
      return {
        ...card,
        ...update,
      }
    },
    async updateList(
      list: Readonly<gpt-voiceList>,
      update: Readonly<gpt-voiceListUpdate>,
    ): Promise<gpt-voiceList> {
      return {
        ...list,
        ...update,
      }
    },
  }
}

test('renders auth inputs when unauthenticated', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({}),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  const dom = await instance.render()
  const text = getText(dom)

  expect(text).toContain('API key')
  expect(text).toContain('Token')
  expect(text).toContain('Welcome to gpt-voice')
  expect(text).toContain('https://gpt-voice.com/power-ups/admin')
  expect(text).toContain('The token grants access to your gpt-voice account')
  expect(hasLabelText(dom, 'API key')).toBe(true)
  expect(hasLabelText(dom, 'Token')).toBe(true)
  expect(getNodeByClass(dom, 'gpt-voiceAuthForm')).toBeDefined()
  expect(hasDirectChildClass(dom, 'gpt-voiceAuthFields', 'gpt-voiceField')).toBe(true)
  expect(hasDirectChildClass(dom, 'gpt-voiceAuthForm', 'gpt-voiceField')).toBe(false)
  expect(getNodeByClass(dom, 'gpt-voiceTitle')).toBeUndefined()
  const apiKeyInput = dom.find((node) => node.name === 'apiKey')
  const tokenInput = dom.find((node) => node.name === 'token')
  if (!apiKeyInput || !tokenInput) {
    throw new Error('Expected auth inputs to render')
  }
  expect(apiKeyInput.inputType).toBeUndefined()
  expect(tokenInput.inputType).toBe('password')
  expect(
    hasNode(dom, (node) => {
      return (
        node.className === 'gpt-voiceWelcomeLink' &&
        node.href === 'https://gpt-voice.com/power-ups/admin' &&
        node.target === '_blank'
      )
    }),
  ).toBe(true)
  resetgpt-voiceViewDependencyFactory()
})

test('dependency reload resets authenticated user state without clearing user credentials in test mode', async () => {
  const userStorage = createMemoryCredentialStorage({
    apiKey: validApiKey,
    token: validToken,
  })
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boards: [{ id: 'user-board', name: 'User Board' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: userStorage,
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  expect(getText(await instance.render())).toContain('User Board')

  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    isTest: true,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))
  await reloadActivegpt-voiceViewInstances()

  const authText = getText(await instance.render())
  expect(authText).toContain('API key')
  expect(authText).not.toContain('User Board')

  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  expect(getText(await instance.render())).toContain('Roadmap')
  await expect(userStorage.read()).resolves.toEqual({
    apiKey: validApiKey,
    token: validToken,
  })
  await instance.dispose?.()
  resetgpt-voiceViewDependencyFactory()
})

test('saves and restores the board filter through view state', async () => {
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const currentBoardStorage = createMemoryCurrentBoardStorage('board-1')
  const boardDetails = {
    'board-1': {
      board: boards[0],
      lists: [
        {
          cards: [
            { id: 'card-1', name: 'Ship filtering' },
            { id: 'card-2', name: 'Document commands' },
          ],
          id: 'list-1',
          name: 'Todo',
        },
      ],
    },
  }
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({ boardDetails, boards }),
    currentBoardStorage,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage({
      apiKey: validApiKey,
      token: validToken,
    }),
  }))

  const instance = await view.create()
  await instance.handleEvent?.({ name: 'openBoardFilter', type: 'click' })
  await instance.handleEvent?.({
    name: 'boardFilter',
    type: 'input',
    value: 'filtering',
  })
  const savedState = instance.saveState?.()

  expect(savedState).toEqual({
    boardId: 'board-1',
    cardId: undefined,
    filterValue: 'filtering',
    isAuthenticated: true,
  })

  await instance.dispose?.()
  const restoredInstance = await view.create({ state: savedState } as any)
  const dom = await restoredInstance.render()

  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain(
    'Ship filtering',
  )
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).not.toContain(
    'Document commands',
  )
  await restoredInstance.dispose?.()
  resetgpt-voiceViewDependencyFactory()
})

test('connect loads boards and clicking board loads detail', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [
                {
                  badges: {
                    comments: 3,
                  },
                  id: 'card-1',
                  labels: [
                    {
                      color: 'blue',
                      id: 'label-1',
                      idBoard: 'board-1',
                      name: 'Extension Api',
                    },
                    {
                      color: 'green_dark',
                      id: 'label-2',
                      idBoard: 'board-1',
                      name: 'Backend',
                    },
                  ],
                  name: 'Ship gpt-voice view',
                },
                {
                  badges: {
                    comments: 0,
                  },
                  cover: {
                    scaled: [
                      {
                        url: 'https://example.com/quiet-card-small.png',
                      },
                      {
                        url: 'https://example.com/quiet-card-large.png',
                      },
                    ],
                  },
                  id: 'card-2',
                  name: 'Quiet card',
                },
                {
                  attachments: [
                    {
                      id: 'attachment-1',
                      mimeType: 'image/png',
                      name: 'Card attachment',
                      url: 'https://example.com/attachment-card.png',
                    },
                  ],
                  id: 'card-3',
                  name: 'Attachment card',
                },
              ],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    imageCache: createMockgpt-voiceImageCache({
      'https://example.com/attachment-card.png': 'blob:attachment-card-cover',
      'https://example.com/quiet-card-large.png': 'blob:quiet-card-large-cover',
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const boardsText = getText(await instance.render())
  expect(boardsText).toContain('Roadmap')
  expect(boardsText).not.toContain('Welcome to gpt-voice')
  expect(boardsText).not.toContain('https://gpt-voice.com/power-ups/admin')

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await waitForCoverImages()

  const detailDom = await instance.render()
  const detailText = getText(detailDom)
  const detailClassNames = getClassNames(detailDom)
  expect(getListTitleInput(detailDom, 'list-1')?.value).toBe('Todo')
  expect(detailText).toContain('Ship gpt-voice view')
  const labeledCardDom = getSubtreeByNodeName(detailDom, 'card:card-1')
  expect(
    hasNode(labeledCardDom, (node) => {
      return node.className === 'gpt-voiceCardLabels gpt-voiceCardPreviewLabels'
    }),
  ).toBe(true)
  expect(
    hasNode(labeledCardDom, (node) => {
      return (
        hasClass(node, 'gpt-voiceCardPreviewLabel') &&
        hasClass(node, 'gpt-voiceCardLabelColorBlue') &&
        node['aria-label'] === 'Extension Api' &&
        node.title === 'Extension Api'
      )
    }),
  ).toBe(true)
  expect(
    hasNode(labeledCardDom, (node) => {
      return (
        hasClass(node, 'gpt-voiceCardPreviewLabel') &&
        hasClass(node, 'gpt-voiceCardLabelColorGreenDark') &&
        node['aria-label'] === 'Backend' &&
        node.title === 'Backend'
      )
    }),
  ).toBe(true)
  expect(detailText).toContain('+ Add a card')
  expect(detailText).not.toContain('3 comments')
  expect(getSubtreeTextByNodeName(detailDom, 'card:card-1')).toContain('3')
  expect(detailText).toContain('Quiet card')
  expect(detailText).toContain('Attachment card')
  const attachmentCardDom = getSubtreeByNodeName(detailDom, 'card:card-3')
  expect(
    hasNode(attachmentCardDom, (node) => {
      return hasClass(node, 'gpt-voiceCardPreviewLabels')
    }),
  ).toBe(false)
  expect(detailText).not.toContain('0 comments')
  expect(getNodeByClass(detailDom, 'gpt-voiceCardMeta')).toMatchObject({
    'aria-label': '3 comments',
    title: '3 comments',
  })
  expect(detailClassNames).toContain('gpt-voiceLists')
  expect(detailClassNames).toContain('gpt-voiceList')
  expect(detailClassNames).toContain('gpt-voiceListHeader')
  expect(detailClassNames).toContain('gpt-voiceListCardCount')
  expect(detailClassNames).toContain('gpt-voiceCards')
  expect(detailClassNames).toContain('gpt-voiceCardTitle')
  expect(detailClassNames).toContain('gpt-voiceCardMeta')
  expect(detailClassNames).toContain('gpt-voiceCardCommentIcon')
  expect(getNodeByClass(detailDom, 'gpt-voiceCardCommentIcon')).toMatchObject({
    alt: '',
    'aria-hidden': true,
    src: `${getExpectedAssetBaseUrl()}media/comments.svg`,
  })
  expect(detailClassNames).toContain('gpt-voiceCardCommentCount')
  expect(detailClassNames).toContain('gpt-voiceCardCoverImage')
  expect(
    hasNode(detailDom, (node) => {
      return hasClass(node, 'gpt-voiceCardWithCover')
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'gpt-voiceCardCoverImage' &&
        node.src === 'blob:quiet-card-large-cover' &&
        node.alt === 'Quiet card cover'
      )
    }),
  ).toBe(true)
  expect(
    hasNode(attachmentCardDom, (node) => {
      return (
        node.className === 'gpt-voiceCardCoverImage' &&
        node.src === 'blob:attachment-card-cover' &&
        node.alt === 'Attachment card cover'
      )
    }),
  ).toBe(true)
  const quietCardDom = getSubtreeByNodeName(detailDom, 'card:card-2')
  expect(getDirectChildClassNamesByName(quietCardDom, 'card:card-2')).toEqual([
    'gpt-voiceCardCoverImage',
    'gpt-voiceCardBody',
  ])
  const listCardCount = getNodeByClass(detailDom, 'gpt-voiceListCardCount')
  const listCardCountIndex = detailDom.indexOf(listCardCount)
  expect(detailDom[listCardCountIndex + 1]?.text).toBe('3')
  expect(
    hasDirectChildClass(
      detailDom,
      'gpt-voiceListHeader',
      'gpt-voiceListTitleInputWrapper',
    ),
  ).toBe(true)
  expect(
    hasDirectChildClass(
      detailDom,
      'gpt-voiceListTitleInputWrapper',
      'gpt-voiceListTitleInput',
    ),
  ).toBe(true)
  expect(
    hasDirectChildClass(detailDom, 'gpt-voiceListHeader', 'gpt-voiceListCardCount'),
  ).toBe(true)
  expect(hasDirectChildClass(detailDom, 'gpt-voiceList', 'gpt-voiceCards')).toBe(true)
  expect(
    hasDirectChildClass(detailDom, 'gpt-voiceList', 'gpt-voiceAddCardButton'),
  ).toBe(true)
  expect(hasDirectChildClass(detailDom, 'gpt-voiceCards', 'gpt-voiceCard')).toBe(true)
  expect(getDirectChildClassNamesByName(detailDom, 'list:list-1')).toEqual([
    'gpt-voiceListHeader',
    'gpt-voiceCards',
    'gpt-voiceAddCardButton',
  ])
  expect(getNodeByName(detailDom, 'addCard:list-1')).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceAddCardButton',
      name: 'addCard:list-1',
      onClick: 'handleClick',
    }),
  )
  resetgpt-voiceViewDependencyFactory()
})

test('card cover image is not rendered when blob resolution fails', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [
                {
                  cover: {
                    scaled: [
                      {
                        url: 'https://example.com/missing-cover.png',
                      },
                    ],
                  },
                  id: 'card-1',
                  name: 'Card with missing cover',
                },
              ],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      imageCache: createMockgpt-voiceImageCache(),
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await waitForCoverImages()

  const dom = await instance.render()
  expect(getText(dom)).toContain('Card with missing cover')
  expect(getClassNames(dom)).not.toContain('gpt-voiceCardCoverImage')
  expect(getClassNames(dom)).not.toContain('gpt-voiceCardWithCover')
  resetgpt-voiceViewDependencyFactory()
})

test('list title renders as editable input', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const dom = await instance.render()
  const title = getListTitleInput(dom, 'list-1')
  expect(title).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceListTitleInput',
      name: 'listTitle:list-1',
      onBlur: 'handleBlur',
      onInput: 'handleInput',
      value: 'Todo',
    }),
  )
  expect(getText(dom)).toContain('No cards')
  expect(getText(dom)).toContain('+ Add a card')
  const listCardCount = getNodeByClass(dom, 'gpt-voiceListCardCount')
  const listCardCountIndex = dom.indexOf(listCardCount)
  expect(dom[listCardCountIndex + 1]?.text).toBe('0')
  expect(getNodeByName(dom, 'addCard:list-1')).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceAddCardButton',
      name: 'addCard:list-1',
      onClick: 'handleClick',
    }),
  )
  resetgpt-voiceViewDependencyFactory()
})

test('cards and lists render drag and drop attributes', async () => {
  expect(view.eventListeners).toEqual([
    {
      name: 'handleImageError',
      params: ['handleImageError', 'event.target.name'],
    },
    {
      name: 'handleDragStart',
      params: ['handleDragStart', 'event.target.name'],
    },
    {
      name: 'handleDragEnd',
      params: ['handleDragEnd'],
    },
    {
      name: 'handleDragOver',
      params: ['handleDragOver', 'event.currentTarget.dataset.id'],
      preventDefault: true,
    },
    {
      name: 'handleDragLeave',
      params: ['handleDragLeave'],
    },
    {
      name: 'handleDrop',
      params: [
        'handleDrop',
        'event.currentTarget.dataset.id',
        'event.dataTransfer.files',
      ],
      preventDefault: true,
    },
    {
      name: 'handleKeyDown',
      params: [
        'handleKeyDown',
        'event.target.name',
        'event.key',
        'event.ctrlKey',
      ],
    },
    {
      name: 'handleSashPointerDown',
      params: ['handleSashPointerDown', 'event.clientX'],
      trackPointerEvents: ['handleSashPointerMove', 'handleSashPointerUp'],
    },
    {
      name: 'handleCardLabelPickerPointerDown',
      params: ['handleCardLabelPickerPointerDown'],
      preventDefault: true,
    },
    {
      name: 'handleAddCardActionPointerDown',
      params: ['handleAddCardActionPointerDown'],
      preventDefault: true,
    },
    {
      name: 'handleCardDescriptionCancelPointerDown',
      params: ['handleCardDescriptionCancelPointerDown'],
      preventDefault: true,
    },
    {
      name: 'handleSashPointerMove',
      params: ['handleSashPointerMove', 'event.clientX'],
    },
    {
      name: 'handleSashPointerUp',
      params: ['handleSashPointerUp'],
    },
  ])
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'card:card-1')).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceCard',
      draggable: true,
      name: 'card:card-1',
      onContextMenu: 'handleContextMenu',
      onDragEnd: 'handleDragEnd',
      onDragStart: 'handleDragStart',
    }),
  )
  expect(getNodeByName(dom, 'card:card-1')).not.toEqual(
    expect.objectContaining({
      onClick: 'handleClick',
    }),
  )
  expect(getNodeByName(dom, 'list:list-1')).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceList',
      'data-id': 'list:list-1',
      name: 'list:list-1',
      onClick: 'handleClick',
      onContextMenu: 'handleContextMenu',
      onDragLeave: 'handleDragLeave',
      onDragOver: 'handleDragOver',
      onDrop: 'handleDrop',
    }),
  )

  await instance.handleEvent?.(createContextMenuEvent('list:list-1', 100, 200))
  expect(contextMenuInvocations).toEqual([['gpt-voice.list', 100, 200]])
  expect((instance as any).getMenuEntries('gpt-voice.list')).toEqual([
    {
      args: ['list-1'],
      command: 'gpt-voice.startAddCard',
      id: 'addCard',
      label: 'Add Card',
    },
    {
      command: 'gpt-voice.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'gpt-voice.backToBoards',
      id: 'backToBoards',
      label: 'Back to Boards',
    },
  ])
  expect(await instance.render()).toEqual(dom)
  resetgpt-voiceViewDependencyFactory()
})

test('clicking add card renders action controls that submit or close the form', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      autocomplete: 'off',
      className: 'gpt-voiceAddCardInput',
      name: 'newCardTitle:list-1',
      onBlur: 'handleBlur',
      onInput: 'handleInput',
      rows: 2,
      type: VirtualDomElements.TextArea,
      value: '',
    }),
  )
  expect(getNodeByName(dom, 'newCardTitle:list-2')).toBeUndefined()
  expect(getNodeByName(dom, 'submitAddCard:list-1')).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceButton gpt-voiceAddCardSubmitButton',
      disabled: false,
      inputType: 'button',
      name: 'submitAddCard:list-1',
      onClick: 'handleClick',
      onPointerDown: 'handleAddCardActionPointerDown',
    }),
  )
  expect(getNodeByName(dom, 'cancelAddCard')).toEqual(
    expect.objectContaining({
      'aria-label': 'Close',
      className: 'gpt-voiceAddCardCloseButton',
      inputType: 'button',
      name: 'cancelAddCard',
      onClick: 'handleClick',
      onPointerDown: 'handleAddCardActionPointerDown',
      title: 'Close',
    }),
  )
  expect(
    hasNode(dom, (node) => {
      return (
        node.name === 'addCard:list-2' &&
        node.className === 'gpt-voiceAddCardButton'
      )
    }),
  ).toBe(true)

  await instance.handleEvent?.({ name: 'cancelAddCard', type: 'click' })
  expect(
    getNodeByName(await instance.render(), 'newCardTitle:list-1'),
  ).toBeUndefined()

  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build add card',
  })
  await instance.handleEvent?.({
    name: 'submitAddCard:list-1',
    type: 'click',
  })
  expect(getText(await instance.render())).toContain('Build add card')
  resetgpt-voiceViewDependencyFactory()
})

test('board overview context menu opens board menu', async () => {
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )

  const dom = await instance.render()
  expect(getNodeByName(dom, 'boards')).toEqual(
    expect.objectContaining({
      name: 'boards',
      onContextMenu: 'handleContextMenu',
    }),
  )

  await instance.handleEvent?.(createContextMenuEvent('boards', 11, 22))

  expect(contextMenuInvocations).toEqual([['gpt-voice.board', 11, 22]])
  expect((instance as any).getMenuEntries('gpt-voice.board')).toEqual([
    {
      command: 'gpt-voice.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'gpt-voice.logout',
      id: 'signOut',
      label: 'Sign Out',
    },
  ])
  resetgpt-voiceViewDependencyFactory()
})

test('renderActionsDom returns no actions before authentication', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({ boards: [] }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))
  const instance = (await view.create()) as VirtualDomViewInstance & {
    readonly renderActionsDom: () => readonly unknown[]
  }

  expect(instance.renderActionsDom()).toEqual([])
  resetgpt-voiceViewDependencyFactory()
})

test('renderActionsDom returns board list actions', async () => {
  const instance = (await createAuthenticatedInstance([
    { id: 'board-1', name: 'Roadmap' },
  ])) as VirtualDomViewInstance & {
    readonly renderActionsDom: () => readonly unknown[]
  }

  expect(instance.renderActionsDom()).toEqual([
    {
      childCount: 2,
      className: 'Actions',
      role: AriaRoles.ToolBar,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'IconButton',
      'data-command': 'gpt-voice.refreshBoards',
      title: 'Refresh Boards',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconRefresh',
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'IconButton',
      'data-command': 'gpt-voice.logout',
      title: 'Sign Out',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconAccount',
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ])
  resetgpt-voiceViewDependencyFactory()
})

test('renderActionsDom returns board detail actions', async () => {
  const instance = (await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [],
        },
      },
    },
  )) as VirtualDomViewInstance & {
    readonly renderActionsDom: () => readonly unknown[]
  }

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  expect(instance.renderActionsDom()).toEqual([
    {
      childCount: 4,
      className: 'Actions',
      role: AriaRoles.ToolBar,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'IconButton',
      'data-command': 'gpt-voice.backToBoards',
      title: 'Back to Boards',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconArrowLeft',
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'IconButton',
      'data-command': 'gpt-voice.refreshBoards',
      title: 'Refresh Boards',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconRefresh',
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    {
      'aria-expanded': false,
      'aria-label': 'Filter cards',
      childCount: 1,
      className: 'IconButton',
      name: 'openBoardFilter',
      onClick: 'handleClick',
      title: 'Filter cards',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconFilter',
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
    {
      childCount: 1,
      className: 'IconButton',
      'data-command': 'gpt-voice.logout',
      title: 'Sign Out',
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: 'MaskIcon MaskIconAccount',
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ])

  await instance.handleEvent?.({ name: 'openBoardFilter', type: 'click' })

  const viewDom = await instance.render()
  expect(
    viewDom.some((node) => node.className === 'gpt-voiceBoardFilterPopup'),
  ).toBe(true)
  expect(
    instance
      .renderActionsDom()
      .find((node: any) => node.name === 'openBoardFilter'),
  ).toEqual(
    expect.objectContaining({
      'aria-expanded': true,
      className: 'IconButton',
    }),
  )

  await instance.handleEvent?.({
    name: 'boardFilter',
    type: 'input',
    value: 'ready',
  })

  expect(
    instance
      .renderActionsDom()
      .find((node: any) => node.name === 'openBoardFilter'),
  ).toEqual(
    expect.objectContaining({
      className: 'IconButton gpt-voiceBoardFilterActionActive',
    }),
  )
  resetgpt-voiceViewDependencyFactory()
})

test('renderTitle moves the current board name into the sidebar title', async () => {
  const instance = (await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [],
        },
      },
    },
  )) as VirtualDomViewInstance & {
    readonly renderTitle: () => string
  }

  expect(instance.renderTitle()).toBe('gpt-voice')

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  expect(instance.renderTitle()).toBe('gpt-voice: Roadmap')
  expect(getClassNames(await instance.render())).not.toContain('gpt-voiceTitle')

  await backToBoardsActivegpt-voiceViewInstance()
  expect(instance.renderTitle()).toBe('gpt-voice')
  resetgpt-voiceViewDependencyFactory()
})

test('back sidebar action returns to the boards view', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const command = view.commands['gpt-voice.backToBoards']
  const newInstance = await command(instance)
  const dom = await newInstance.render()

  expect(newInstance).toBe(instance)
  expect(getNodeByName(dom, 'board:board-1')).toBeDefined()
  expect(getClassNames(dom)).not.toContain('gpt-voiceBoardDetail')
  resetgpt-voiceViewDependencyFactory()
})

test('boards view does not render sidebar actions inside content', async () => {
  const instance = await createAuthenticatedInstance([
    { id: 'board-1', name: 'Roadmap' },
  ])

  const dom = await instance.render()

  expect(getNodeByName(dom, 'refreshBoards')).toBeUndefined()
  expect(getNodeByName(dom, 'logout')).toBeUndefined()
  resetgpt-voiceViewDependencyFactory()
})

test('board detail view does not render sidebar actions inside content', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  const dom = await instance.render()

  expect(getNodeByName(dom, 'backToBoards')).toBeUndefined()
  expect(getNodeByName(dom, 'logout')).toBeUndefined()
  resetgpt-voiceViewDependencyFactory()
})

test('card context menu opens card menu with target args', async () => {
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  await instance.handleEvent?.(createContextMenuEvent('card:card-1', 33, 44))

  expect(contextMenuInvocations).toEqual([['gpt-voice.card', 33, 44]])
  expect((instance as any).getMenuEntries('gpt-voice.card')).toEqual([
    {
      args: ['card-1'],
      command: 'gpt-voice.openCard',
      id: 'openCard',
      label: 'Open Card',
    },
    {
      args: ['list-1'],
      command: 'gpt-voice.startAddCard',
      id: 'addCard',
      label: 'Add Card',
    },
    {
      command: 'gpt-voice.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'gpt-voice.backToBoards',
      id: 'backToBoards',
      label: 'Back to Boards',
    },
  ])
  resetgpt-voiceViewDependencyFactory()
})

test('card detail context menu opens card detail menu', async () => {
  const contextMenuInvocations: unknown[] = []
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      showContextMenu: async (menuId: string, x: number, y: number) => {
        contextMenuInvocations.push([menuId, x, y])
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'cardDetail')).toEqual(
    expect.objectContaining({
      name: 'cardDetail',
      onContextMenu: 'handleContextMenu',
    }),
  )

  await instance.handleEvent?.(createContextMenuEvent('cardDetail', 55, 66))

  expect(contextMenuInvocations).toEqual([['gpt-voice.cardDetail', 55, 66]])
  expect((instance as any).getMenuEntries('gpt-voice.cardDetail')).toEqual([
    {
      command: 'gpt-voice.saveCardDetail',
      id: 'saveCard',
      label: 'Save Card',
    },
    {
      command: 'gpt-voice.closeCardDetail',
      id: 'closeCard',
      label: 'Close Card',
    },
    {
      command: 'gpt-voice.refreshBoards',
      id: 'refreshBoards',
      label: 'Refresh Boards',
    },
    {
      command: 'gpt-voice.backToBoards',
      id: 'backToBoards',
      label: 'Back to Boards',
    },
  ])
  resetgpt-voiceViewDependencyFactory()
})

test('view context tracks board and new-card input focus', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  const withContext = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
    readonly renderFocus: (
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ) => string
  }

  expect(withContext.getContext()).toEqual({
    'gpt-voice.boardsFocus': true,
  })

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  expect(withContext.getContext()).toEqual({
    'gpt-voice.boardDetailFocus': true,
  })

  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  const addCardContext = withContext.getContext()
  expect(addCardContext).toEqual({
    'gpt-voice.boardDetailFocus': true,
    'gpt-voice.newCardInputFocus': true,
  })
  expect(
    withContext.renderFocus(
      {
        'gpt-voice.boardDetailFocus': true,
      },
      addCardContext,
    ),
  ).toBe('[name="newCardTitle:list-1"]')

  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'focus',
  })
  expect(withContext.getContext()).toEqual({
    'gpt-voice.boardDetailFocus': true,
    'gpt-voice.newCardInputFocus': true,
  })

  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'blur',
  })
  expect(withContext.getContext()).toEqual({
    'gpt-voice.boardDetailFocus': true,
  })

  resetgpt-voiceViewDependencyFactory()
})

test('renderSelections selects the whole list title once on focus', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  const withSelections = instance as VirtualDomViewInstance & {
    readonly renderSelections: () => readonly ViewSelection[]
  }

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'focus' })

  expect(withSelections.renderSelections()).toEqual([
    {
      end: 4,
      name: 'listTitle:list-1',
      start: 0,
    },
  ])
  expect(withSelections.renderSelections()).toEqual([])

  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: 'Planning',
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'focus' })
  expect(withSelections.renderSelections()).toEqual([
    {
      end: 8,
      name: 'listTitle:list-1',
      start: 0,
    },
  ])

  resetgpt-voiceViewDependencyFactory()
})

test('renderFocus returns card description selector when editing description starts', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: 'Existing description',
            id: 'card-1',
            idList: 'list-1',
            name: 'Plan work',
          },
          comments: [],
        },
      },
    },
  )
  const withFocus = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
    readonly renderFocus: (
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ) => string
  }

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  const cardContext = withFocus.getContext()
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })
  const descriptionContext = withFocus.getContext()

  expect(descriptionContext).toEqual({
    'gpt-voice.boardDetailFocus': true,
    'gpt-voice.cardDescriptionFocus': true,
    'gpt-voice.cardDetailFocus': true,
  })
  expect(withFocus.renderFocus(cardContext, descriptionContext)).toBe(
    '[name="cardDescription"]',
  )

  resetgpt-voiceViewDependencyFactory()
})

test('active keybinding commands submit and cancel new card input', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build shortcuts',
  })
  await submitNewCardActivegpt-voiceViewInstance()
  expect(getText(await instance.render())).toContain('Build shortcuts')

  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  cancelNewCardActivegpt-voiceViewInstance()
  expect(
    getNodeByName(await instance.render(), 'newCardTitle:list-1'),
  ).toBeUndefined()

  resetgpt-voiceViewDependencyFactory()
})

test('escape closes new card input and preserves its draft for another list', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Draft card',
  })
  await instance.handleKeyDown('newCardTitle:list-1', 'Escape')

  expect(
    getNodeByName(await instance.render(), 'newCardTitle:list-1'),
  ).toBeUndefined()
  await instance.handleEvent?.({ name: 'addCard:list-2', type: 'click' })
  expect(getNodeByName(await instance.render(), 'newCardTitle:list-2')).toEqual(
    expect.objectContaining({
      value: 'Draft card',
    }),
  )

  resetgpt-voiceViewDependencyFactory()
})

test('blur closes new card input and preserves its draft', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Draft card',
  })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'blur',
  })

  expect(
    getNodeByName(await instance.render(), 'newCardTitle:list-1'),
  ).toBeUndefined()
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  expect(getNodeByName(await instance.render(), 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      value: 'Draft card',
    }),
  )

  resetgpt-voiceViewDependencyFactory()
})

test('active keybinding commands navigate board and close card detail', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  expect(getText(await instance.render())).toContain('Plan work')

  closeCardDetailActivegpt-voiceViewInstance()
  expect(
    getNodeByName(await instance.render(), 'closeCardDetail'),
  ).toBeUndefined()

  await backToBoardsActivegpt-voiceViewInstance()
  expect(getBoardButtonLabels(await instance.render())).toContain('Roadmap')

  resetgpt-voiceViewDependencyFactory()
})

test('active keybinding command saves card description', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  const withContext = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
  }

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })
  await instance.handleEvent?.({ name: 'cardDescription', type: 'focus' })
  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Shortcut saved description',
  })

  expect(withContext.getContext()).toEqual({
    'gpt-voice.boardDetailFocus': true,
    'gpt-voice.cardDescriptionFocus': true,
    'gpt-voice.cardDetailFocus': true,
  })

  await saveCardDetailActivegpt-voiceViewInstance()
  const text = getText(await instance.render())
  expect(text).toContain('Shortcut saved description')

  resetgpt-voiceViewDependencyFactory()
})

test('submitting add card appends card and focuses an empty input for the next card', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build add card',
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const dom = await instance.render()
  const todoText = getSubtreeTextByNodeName(dom, 'list:list-1')
  const doingText = getSubtreeTextByNodeName(dom, 'list:list-2')
  expect(todoText).toContain('Plan work')
  expect(todoText).toContain('Build add card')
  expect(todoText.indexOf('Plan work')).toBeLessThan(
    todoText.indexOf('Build add card'),
  )
  expect(doingText).not.toContain('Build add card')
  expect(getNodeByName(dom, 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      disabled: false,
      value: '',
    }),
  )
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Write tests',
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const nextDom = await instance.render()
  expect(getSubtreeTextByNodeName(nextDom, 'list:list-1')).toContain(
    'Write tests',
  )
  expect(getNodeByName(nextDom, 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      disabled: false,
      value: '',
    }),
  )
  const withContext = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
    readonly renderFocus: (
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ) => string
  }
  const nextCardContext = withContext.getContext()
  expect(nextCardContext).toEqual({
    'gpt-voice.boardDetailFocus': true,
    'gpt-voice.newCardInputFocus': true,
  })
  expect(
    withContext.renderFocus(
      {
        'gpt-voice.boardDetailFocus': true,
      },
      nextCardContext,
    ),
  ).toBe('[name="newCardTitle:list-1"]')
  resetgpt-voiceViewDependencyFactory()
})

test('add card stays open when saving blurs the input', async () => {
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const boardDetails = {
    'board-1': {
      board: boards[0],
      lists: [
        {
          cards: [],
          id: 'list-1',
          name: 'Todo',
        },
      ],
    },
  }
  const card = createDeferred<gpt-voiceCard>()
  const mockClient = createMockgpt-voiceClient({
    boardDetails,
    boards,
  })
  const client: gpt-voiceClient = {
    ...mockClient,
    createCard: async () => card.promise,
  }
  const instance = await createAuthenticatedInstance(boards, [], {
    boardDetails,
    client,
  })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build add card',
  })

  const submit = instance.handleEvent?.({
    name: 'submitAddCard:list-1',
    type: 'click',
  })
  await Promise.resolve()
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'blur',
  })

  expect(getNodeByName(await instance.render(), 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      disabled: true,
      value: 'Build add card',
    }),
  )

  card.resolve({
    id: 'created-card-1',
    idList: 'list-1',
    name: 'Build add card',
  })
  await submit

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain(
    'Build add card',
  )
  expect(getNodeByName(dom, 'newCardTitle:list-1')).toEqual(
    expect.objectContaining({
      disabled: false,
      value: '',
    }),
  )
  resetgpt-voiceViewDependencyFactory()
})

test('submitting blank add card keeps input open with error', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'newCardTitle:list-1')?.value).toBe(' '.repeat(3))
  expect(getText(dom)).toContain('Card title is required.')
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).not.toContain(
    'created-card',
  )
  resetgpt-voiceViewDependencyFactory()
})

test('add card failure keeps input open and preserves draft', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardCreateErrors: {
        'list-1': 'Cannot create card',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'newCardTitle:list-1',
    type: 'input',
    value: 'Build add card',
  })
  await instance.handleEvent?.({ name: 'addCard:list-1', type: 'submit' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'newCardTitle:list-1')?.value).toBe(
    'Build add card',
  )
  expect(getText(dom)).toContain('Cannot create card')
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).not.toContain(
    'Build add card',
  )
  resetgpt-voiceViewDependencyFactory()
})

test('drag over marks list as drag target', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleDragStart('card:card-1')
  await instance.handleDragOver('list:list-1')

  const dragTargetDom = await instance.render()
  expect(
    hasClass(
      getNodeByName(dragTargetDom, 'list:list-1'),
      'gpt-voiceListDragTarget',
    ),
  ).toBe(true)

  await instance.handleDragLeave()
  const clearedDom = await instance.render()
  expect(
    hasClass(getNodeByName(clearedDom, 'list:list-1'), 'gpt-voiceListDragTarget'),
  ).toBe(false)

  await instance.handleDragStart('card:card-1')
  await instance.handleDragOver('list:list-1')
  await instance.handleDragEnd()
  const dragEndDom = await instance.render()
  expect(
    hasClass(getNodeByName(dragEndDom, 'list:list-1'), 'gpt-voiceListDragTarget'),
  ).toBe(false)
  resetgpt-voiceViewDependencyFactory()
})

test('dropping card on another list moves card to top', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleDragStart('card:card-1')
  await instance.handleDrop('list:list-2')

  const dom = await instance.render()
  const todoText = getSubtreeTextByNodeName(dom, 'list:list-1')
  const doingText = getSubtreeTextByNodeName(dom, 'list:list-2')
  expect(todoText).not.toContain('Plan work')
  expect(doingText).toContain('Build work')
  expect(doingText).toContain('Plan work')
  expect(doingText.indexOf('Plan work')).toBeLessThan(
    doingText.indexOf('Build work'),
  )
  resetgpt-voiceViewDependencyFactory()
})

test('dropping card on the same list is a no-op', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
      cardMoveErrors: {
        'card-1': 'Move should not be called',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleDragStart('card:card-1')
  await instance.handleDrop('list:list-1')

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain('Plan work')
  expect(getSubtreeTextByNodeName(dom, 'list:list-2')).not.toContain(
    'Plan work',
  )
  expect(getText(dom)).not.toContain('Move should not be called')
  resetgpt-voiceViewDependencyFactory()
})

test('failed card drop preserves placement and shows error', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
      cardMoveErrors: {
        'card-1': 'Cannot move card',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleDragStart('card:card-1')
  await instance.handleDrop('list:list-2')

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain('Plan work')
  expect(getSubtreeTextByNodeName(dom, 'list:list-2')).not.toContain(
    'Plan work',
  )
  expect(getText(dom)).toContain('Cannot move card')
  resetgpt-voiceViewDependencyFactory()
})

test('editing list title saves on blur', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: 'Doing',
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'blur' })

  const title = getListTitleInput(await instance.render(), 'list-1')
  expect(title?.value).toBe('Doing')
  expect(getText(await instance.render())).not.toContain(
    'List title is required.',
  )
  resetgpt-voiceViewDependencyFactory()
})

test('board detail creates another list from the trailing list control', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const initialDom = await instance.render()
  expect(getText(initialDom)).toContain('Create New list')
  expect(getNodeByName(initialDom, 'newListTitle')).toBeUndefined()

  await instance.handleEvent?.({ name: 'startAddList', type: 'click' })

  const addingDom = await instance.render()
  expect(getNodeByName(addingDom, 'newListTitle')).toMatchObject({
    name: 'newListTitle',
    onBlur: 'handleBlur',
    placeholder: 'Enter list title',
  })

  await instance.handleEvent?.({ name: 'newListTitle', type: 'blur' })

  const blurredDom = await instance.render()
  expect(getNodeByName(blurredDom, 'newListTitle')).toBeUndefined()
  expect(getText(blurredDom)).toContain('Create New list')

  await instance.handleEvent?.({ name: 'startAddList', type: 'click' })
  expect(getNodeByName(await instance.render(), 'newListTitle')).toBeDefined()

  await instance.handleKeyDown('newListTitle', 'Escape')

  const cancelledDom = await instance.render()
  expect(getNodeByName(cancelledDom, 'newListTitle')).toBeUndefined()

  await instance.handleEvent?.({ name: 'startAddList', type: 'click' })
  await instance.handleEvent?.({
    name: 'newListTitle',
    type: 'input',
    value: 'Done',
  })
  await instance.handleEvent?.({ name: 'addList', type: 'submit' })

  const updatedDom = await instance.render()
  expect(getListTitleInput(updatedDom, 'created-list-1')?.value).toBe('Done')
  expect(getNodeByName(updatedDom, 'newListTitle')).toBeUndefined()
  resetgpt-voiceViewDependencyFactory()
})

test('empty list title restores old title on blur', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'blur' })

  const dom = await instance.render()
  expect(getListTitleInput(dom, 'list-1')?.value).toBe('Todo')
  expect(getText(dom)).toContain('List title is required.')
  resetgpt-voiceViewDependencyFactory()
})

test('failed list title update restores old title on blur', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      listUpdateErrors: {
        'list-1': 'gpt-voice request failed: 500 unavailable',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'listTitle:list-1',
    type: 'input',
    value: 'Doing',
  })
  await instance.handleEvent?.({ name: 'listTitle:list-1', type: 'blur' })

  const dom = await instance.render()
  expect(getListTitleInput(dom, 'list-1')?.value).toBe('Todo')
  expect(getText(dom)).toContain('gpt-voice request failed: 500 unavailable')
  resetgpt-voiceViewDependencyFactory()
})
test('clicking card renders card detail and close dismisses it', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [
            {
              id: 'attachment-1',
              mimeType: 'image/png',
              name: 'Screenshot',
              url: 'https://example.com/screenshot.png',
            },
          ],
          card: {
            desc: 'Detailed card description',
            id: 'card-1',
            labels: [
              {
                color: 'blue',
                id: 'label-1',
                idBoard: 'board-1',
                name: 'Extension Api',
              },
            ],
            name: 'Ship gpt-voice view',
            url: 'https://gpt-voice.com/c/card-1',
          },
          comments: [
            {
              data: {
                text: 'This should show under the description.',
              },
              date: '2026-07-03T10:11:00.000Z',
              id: 'comment-1',
              memberCreator: {
                fullName: 'Test User',
                initials: 'TU',
              },
            },
          ],
        },
      },
    }),
    imageCache: createMockgpt-voiceImageCache({
      'https://example.com/screenshot.png': 'blob:private-screenshot',
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = await view.create()
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Detailed card description')
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.name === 'editCardDescription' &&
        node.className === 'gpt-voiceButton gpt-voiceCardDescriptionEditButton'
      )
    }),
  ).toBe(true)
  expect(text).toContain('Comments')
  expect(text).toContain('TU')
  expect(text).toContain('Test User')
  expect(text).toContain('Jul 3, 2026, 12:11 PM')
  expect(text).toContain('This should show under the description.')
  expect(text).toContain('Extension Api')
  expect(text).toContain('Open in gpt-voice')
  expect(text.indexOf('Detailed card description')).toBeLessThan(
    text.indexOf('Comments'),
  )
  expect(text.indexOf('Test User')).toBeLessThan(
    text.indexOf('Jul 3, 2026, 12:11 PM'),
  )
  expect(text.indexOf('Jul 3, 2026, 12:11 PM')).toBeLessThan(
    text.indexOf('This should show under the description.'),
  )
  expect(text.indexOf('This should show under the description.')).toBeLessThan(
    text.indexOf('Images'),
  )
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardDetailPanel')

  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })

  const editingDom = await instance.render()
  expect(getNodeByName(editingDom, 'cardDescription')?.value).toBe(
    'Detailed card description',
  )
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardDetailImage')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardComments')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardComment')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardCommentAvatar')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardCommentContent')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardCommentHeader')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardCommentAuthor')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardCommentDate')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardCommentText')
  expect(hasDirectChildClass(detailDom, 'gpt-voiceCards', 'gpt-voiceCard')).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'gpt-voiceCardDetailImage' &&
        node.name === 'attachment-1' &&
        node.onError === 'handleImageError' &&
        node.src === 'blob:private-screenshot'
      )
    }),
  ).toBe(true)

  await instance.handleImageError('attachment-1')

  const imageErrorDom = await instance.render()
  expect(getClassNames(imageErrorDom)).not.toContain('gpt-voiceCardDetailImage')
  expect(getClassNames(imageErrorDom)).toContain('gpt-voiceCardDetailImageError')
  expect(getText(imageErrorDom)).toContain('Image could not be loaded.')
  expect(
    hasNode(detailDom, (node) => {
      return (
        typeof node.className === 'string' &&
        node.className.includes('gpt-voiceCardLabel') &&
        node.className.includes('gpt-voiceCardLabelColorBlue')
      )
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'gpt-voiceCardDetailLink' &&
        node.href === 'https://gpt-voice.com/c/card-1'
      )
    }),
  ).toBe(true)
  expect(text).not.toContain('Close')
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.name === 'closeCardDetail' &&
        typeof node.className === 'string' &&
        node.className.includes('gpt-voiceCardDetailCloseButton')
      )
    }),
  ).toBe(true)

  await instance.handleEvent?.({ name: 'closeCardDetail', type: 'click' })

  const closedDom = await instance.render()
  expect(getListTitleInput(closedDom, 'list-1')?.value).toBe('Todo')
  expect(getText(closedDom)).toContain('Ship gpt-voice view')
  expect(getClassNames(closedDom)).not.toContain('gpt-voiceCardDetailPanel')
  resetgpt-voiceViewDependencyFactory()
})

test('clicking already opened card does nothing', async () => {
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const boardDetail = {
    board: boards[0],
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  const cardDetail: gpt-voiceCardDetail = {
    attachments: [],
    card: {
      desc: 'Detailed card description',
      id: 'card-1',
      name: 'Ship gpt-voice view',
    },
    comments: [],
  }
  let getCardDetailCallCount = 0
  setgpt-voiceViewDependencyFactory(() => ({
    client: createStagedCardClient({
      boardDetail,
      boards,
      async getCardDetailPartsCacheFirst() {
        getCardDetailCallCount++
        return {
          cached: undefined,
          fresh: {
            attachments: Promise.resolve(cardDetail.attachments),
            card: Promise.resolve(cardDetail.card),
            comments: Promise.resolve(cardDetail.comments),
          },
        }
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  expect(getCardDetailCallCount).toBe(1)
  expect(getText(await instance.render())).toContain(
    'Detailed card description',
  )

  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  expect(getCardDetailCallCount).toBe(1)
  resetgpt-voiceViewDependencyFactory()
})

test('card detail panel resizes from the left sash', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const initialDom = await instance.render()
  expect(getNodeByName(initialDom, 'resizeCardDetail')).toMatchObject({
    className: 'gpt-voiceCardDetailResizeSash',
    onPointerDown: 'handleSashPointerDown',
  })
  expect(
    getDirectChildClassNamesByClassName(initialDom, 'gpt-voiceBoardDetailContent'),
  ).toEqual([
    'gpt-voiceLists',
    'gpt-voiceCardDetailResizeSash',
    'gpt-voiceCardDetailPanel',
  ])
  expect(getNodeByName(initialDom, 'cardDetail')?.style).toBeUndefined()
  expect(instance.getCss()).toContain('--gpt-voiceCardDetailWidth: 360px')

  await instance.handleSashPointerDown(100)
  await instance.handleSashPointerMove(60)

  expect(instance.getCss()).toContain('--gpt-voiceCardDetailWidth: 400px')

  await instance.handleSashPointerMove(500)
  await instance.handleSashPointerUp()

  expect(instance.getCss()).toContain('--gpt-voiceCardDetailWidth: 200px')
  resetgpt-voiceViewDependencyFactory()
})

test('card detail opens in a popup when enabled', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetailPopupEnabled: true,
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const dom = await instance.render()
  expect(getNodeByName(dom, 'resizeCardDetail')).toBeUndefined()
  expect(
    getDirectChildClassNamesByClassName(dom, 'gpt-voiceBoardDetailContent'),
  ).toEqual(['gpt-voiceLists', 'gpt-voiceCardDetailPopup'])
  expect(
    getDirectChildClassNamesByClassName(dom, 'gpt-voiceCardDetailPopup'),
  ).toEqual(['gpt-voiceCardDetailPanel gpt-voiceCardDetailPanelPopup'])
  resetgpt-voiceViewDependencyFactory()
})

test('card detail comment controls and shortcuts save and cancel comments', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const initialDom = await instance.render()
  expect(getText(initialDom)).toContain('Write a comment')
  expect(getNodeByName(initialDom, 'cardComment')).toBeUndefined()

  await instance.handleEvent?.({ name: 'startWriteComment', type: 'click' })

  const writingDom = await instance.render()
  expect(getNodeByName(writingDom, 'cardComment')).toMatchObject({
    autofocus: true,
    name: 'cardComment',
    placeholder: 'Write a comment...',
  })
  expect(getNodeByName(writingDom, 'submitComment')).toMatchObject({
    name: 'submitComment',
    onClick: 'handleClick',
  })
  expect(getNodeByName(writingDom, 'cancelWriteComment')).toMatchObject({
    name: 'cancelWriteComment',
    onClick: 'handleClick',
  })

  await instance.handleEvent?.({ name: 'cancelWriteComment', type: 'click' })

  const cancelledDom = await instance.render()
  expect(getNodeByName(cancelledDom, 'cardComment')).toBeUndefined()

  await instance.handleEvent?.({ name: 'startWriteComment', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardComment',
    type: 'input',
    value: 'Looks good',
  })
  await instance.handleEvent?.({ name: 'submitComment', type: 'click' })

  const updatedDom = await instance.render()
  expect(getText(updatedDom)).toContain('Looks good')
  expect(getNodeByName(updatedDom, 'cardComment')).toBeUndefined()

  await instance.handleEvent?.({ name: 'startWriteComment', type: 'click' })
  await instance.handleKeyDown('cardComment', 'Escape')
  expect(getNodeByName(await instance.render(), 'cardComment')).toBeUndefined()

  await instance.handleEvent?.({ name: 'startWriteComment', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardComment',
    type: 'input',
    value: 'Saved with the keyboard',
  })
  await instance.handleKeyDown('cardComment', 'Enter', true)
  expect(getText(await instance.render())).toContain('Saved with the keyboard')
  resetgpt-voiceViewDependencyFactory()
})

test('card detail omits empty images section', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: 'Detailed card description',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Detailed card description')
  expect(text).not.toContain('Images')
  expect(text).not.toContain('No images')
  expect(getClassNames(detailDom)).not.toContain('gpt-voiceCardDetailImages')
  resetgpt-voiceViewDependencyFactory()
})

test('card detail renders current list selector with board lists', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const dom = await instance.render()
  const select = getNodeByName(dom, 'cardList:card-1')
  const selectSubtree = getSubtreeByNodeName(dom, 'cardList:card-1')
  expect(select).toEqual(
    expect.objectContaining({
      className: 'gpt-voiceInput gpt-voiceCardListSelect',
      name: 'cardList:card-1',
      onInput: 'handleInput',
      type: VirtualDomElements.Select,
      value: 'list-1',
    }),
  )
  expect(getText(selectSubtree)).toContain('Todo')
  expect(getText(selectSubtree)).toContain('Doing')
  expect(
    hasNode(selectSubtree, (node) => {
      return (
        node.type === VirtualDomElements.Option &&
        node.value === 'list-1' &&
        node.selected === true
      )
    }),
  ).toBe(true)
  resetgpt-voiceViewDependencyFactory()
})

test('changing card detail list selector moves card to bottom of selected list', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardList:card-1',
    type: 'input',
    value: 'list-2',
  })

  const dom = await instance.render()
  const todoText = getSubtreeTextByNodeName(dom, 'list:list-1')
  const doingText = getSubtreeTextByNodeName(dom, 'list:list-2')
  expect(todoText).not.toContain('Plan work')
  expect(doingText).toContain('Build work')
  expect(doingText).toContain('Plan work')
  expect(doingText.indexOf('Build work')).toBeLessThan(
    doingText.indexOf('Plan work'),
  )
  expect(getNodeByName(dom, 'cardList:card-1')?.value).toBe('list-2')
  resetgpt-voiceViewDependencyFactory()
})

test('changing card detail list selector to same list is a no-op', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
      cardMoveErrors: {
        'card-1': 'Move should not be called',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardList:card-1',
    type: 'input',
    value: 'list-1',
  })

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain('Plan work')
  expect(getSubtreeTextByNodeName(dom, 'list:list-2')).not.toContain(
    'Plan work',
  )
  expect(getText(dom)).not.toContain('Move should not be called')
  resetgpt-voiceViewDependencyFactory()
})

test('failed card detail list selector move preserves placement and shows error', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', idList: 'list-1', name: 'Plan work' }],
              id: 'list-1',
              name: 'Todo',
            },
            {
              cards: [{ id: 'card-2', idList: 'list-2', name: 'Build work' }],
              id: 'list-2',
              name: 'Doing',
            },
          ],
        },
      },
      cardMoveErrors: {
        'card-1': 'Cannot move card',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardList:card-1',
    type: 'input',
    value: 'list-2',
  })

  const dom = await instance.render()
  expect(getSubtreeTextByNodeName(dom, 'list:list-1')).toContain('Plan work')
  expect(getSubtreeTextByNodeName(dom, 'list:list-2')).not.toContain(
    'Plan work',
  )
  expect(getNodeByName(dom, 'cardList:card-1')?.value).toBe('list-1')
  expect(getText(dom)).toContain('Cannot move card')
  resetgpt-voiceViewDependencyFactory()
})

test('card detail label picker adds an existing board label', async () => {
  const labels: readonly gpt-voiceLabel[] = [
    {
      color: 'blue',
      id: 'label-1',
      idBoard: 'board-1',
      name: 'Extension Api',
    },
    {
      color: 'red',
      id: 'label-2',
      idBoard: 'board-1',
      name: 'Bug',
    },
  ]
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boardLabels: {
        'board-1': labels,
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            labels: [],
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  const withFocus = instance as VirtualDomViewInstance & {
    readonly getContext: () => Readonly<Record<string, boolean>>
    readonly renderFocus: (
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ) => string
  }

  const initialDom = await instance.render()
  expect(getText(initialDom)).toContain('Labels')
  expect(getNodeByName(initialDom, 'cardLabelPicker')).toBeUndefined()
  const cardContext = withFocus.getContext()

  await instance.handleEvent?.({ name: 'openCardLabelPicker', type: 'click' })

  const openDom = await instance.render()
  expect(getNodeByName(openDom, 'cardLabelPicker')).toMatchObject({
    onPointerDown: 'handleCardLabelPickerPointerDown',
  })
  expect(getNodeByName(openDom, 'cardLabelSearch')).toMatchObject({
    onBlur: 'handleBlur',
    onFocus: 'handleFocus',
    value: '',
  })
  const labelPickerContext = withFocus.getContext()
  expect(labelPickerContext).toMatchObject({
    'gpt-voice.cardLabelPickerFocus': true,
  })
  expect(withFocus.renderFocus(cardContext, labelPickerContext)).toBe(
    '[name="cardLabelSearch"]',
  )
  expect(getSubtreeTextByNodeName(openDom, 'cardLabelPicker')).toContain(
    'Labels',
  )
  expect(getNodeByName(openDom, 'closeCardLabelPicker')).toBeDefined()
  expect(getSubtreeTextByNodeName(openDom, 'cardLabelPicker')).toContain(
    'Extension Api',
  )
  expect(getSubtreeTextByNodeName(openDom, 'cardLabelPicker')).toContain('Bug')
  expect(getNodeByName(openDom, 'cardLabelCheckbox:label-1')).toMatchObject({
    checked: false,
    inputType: 'checkbox',
  })
  expect(getNodeByName(openDom, 'addCardLabel:label-1')).toMatchObject({
    className: 'gpt-voiceCardLabelChoice',
  })
  expect(
    getDirectChildClassNamesByName(openDom, 'addCardLabel:label-1'),
  ).toEqual([
    'gpt-voiceCardLabelChoiceCheckbox',
    'gpt-voiceCardLabelChoiceText gpt-voiceCardLabelColorBlue',
  ])

  await instance.handleEvent?.({ name: 'closeCardLabelPicker', type: 'click' })

  const closedDom = await instance.render()
  expect(getNodeByName(closedDom, 'cardLabelPicker')).toBeUndefined()

  await instance.handleEvent?.({ name: 'openCardLabelPicker', type: 'click' })

  await instance.handleEvent?.({
    name: 'cardLabelSearch',
    type: 'input',
    value: 'bug',
  })

  const filteredDom = await instance.render()
  const filteredPickerText = getSubtreeTextByNodeName(
    filteredDom,
    'cardLabelPicker',
  )
  expect(filteredPickerText).toContain('Bug')
  expect(filteredPickerText).not.toContain('Extension Api')

  await instance.handleCardLabelPickerPointerDown()
  await instance.handleEvent?.({ name: 'addCardLabel:label-2', type: 'click' })

  const updatedDom = await instance.render()
  expect(getText(updatedDom)).toContain('Bug')
  expect(getNodeByName(updatedDom, 'cardLabelPicker')).toBeDefined()
  expect(getNodeByName(updatedDom, 'cardLabelCheckbox:label-2')).toMatchObject({
    checked: true,
    inputType: 'checkbox',
  })
  expect(getNodeByName(updatedDom, 'openCardLabelPicker')).toBeDefined()

  await instance.handleEvent?.({ name: 'cardLabelSearch', type: 'blur' })

  const blurredDom = await instance.render()
  expect(getNodeByName(blurredDom, 'cardLabelPicker')).toBeUndefined()
  resetgpt-voiceViewDependencyFactory()
})

test('card detail label picker creates and assigns a new label', async () => {
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', labels: [], name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boardLabels: {
        'board-1': [],
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            labels: [],
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({ name: 'openCardLabelPicker', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardLabelSearch',
    type: 'input',
    value: 'Documentation',
  })

  const unmatchedDom = await instance.render()
  expect(getSubtreeTextByNodeName(unmatchedDom, 'cardLabelPicker')).toContain(
    'Create a new label',
  )
  expect(getNodeByName(unmatchedDom, 'openCardLabelCreate')).toBeDefined()

  await instance.handleEvent?.({ name: 'openCardLabelCreate', type: 'click' })
  await instance.handleEvent?.({ name: 'cardLabelSearch', type: 'blur' })

  const createDom = await instance.render()
  expect(getNodeByName(createDom, 'cardLabelSearch')).toBeUndefined()
  expect(getNodeByName(createDom, 'newLabelName')).toMatchObject({
    value: 'Documentation',
  })
  expect(getNodeByName(createDom, 'selectCardLabelColor:green')).toMatchObject({
    'aria-pressed': true,
  })
  expect(getNodeByName(createDom, 'selectCardLabelColor:purple')).toMatchObject(
    {
      'aria-pressed': false,
    },
  )
  await instance.handleEvent?.({
    name: 'selectCardLabelColor:purple',
    type: 'click',
  })
  await instance.handleEvent?.({ name: 'createCardLabel', type: 'click' })

  const createdDom = await instance.render()
  expect(getNodeByName(createdDom, 'cardLabelPicker')).toBeDefined()
  expect(
    getNodeByName(createdDom, 'addCardLabel:created-label-1'),
  ).toBeDefined()
  expect(
    getNodeByName(createdDom, 'cardLabelCheckbox:created-label-1'),
  ).toMatchObject({
    checked: true,
  })
  expect(
    hasNode(createdDom, (node) => {
      return (
        node.name === 'openCardLabelPicker' &&
        hasClass(node, 'gpt-voiceCardLabelColorPurple')
      )
    }),
  ).toBe(true)
  resetgpt-voiceViewDependencyFactory()
})

test('card detail label picker checks assigned labels and keeps open on failure', async () => {
  const labels: readonly gpt-voiceLabel[] = [
    {
      color: 'blue',
      id: 'label-1',
      idBoard: 'board-1',
      name: 'Extension Api',
    },
    {
      color: 'red',
      id: 'label-2',
      idBoard: 'board-1',
      name: 'Bug',
    },
  ]
  const appliedLabel = labels[0]
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [
                {
                  id: 'card-1',
                  labels: [appliedLabel],
                  name: 'Ship gpt-voice view',
                },
              ],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boardLabels: {
        'board-1': labels,
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            labels: [appliedLabel],
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
      cardLabelAddErrors: {
        'card-1': 'gpt-voice request failed: 500 unavailable',
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const labeledDom = await instance.render()
  expect(getText(labeledDom)).toContain('Extension Api')
  expect(getNodeByName(labeledDom, 'openCardLabelPicker')).toBeDefined()
  expect(
    hasNode(labeledDom, (node) => {
      return (
        node.name === 'openCardLabelPicker' &&
        node.onClick === 'handleClick' &&
        hasClass(node, 'gpt-voiceCardLabelButton') &&
        hasClass(node, 'gpt-voiceCardLabelColorBlue')
      )
    }),
  ).toBe(true)

  await instance.handleEvent?.({ name: 'openCardLabelPicker', type: 'click' })

  const pickerDom = await instance.render()
  const pickerText = getSubtreeTextByNodeName(pickerDom, 'cardLabelPicker')
  expect(pickerText).toContain('Extension Api')
  expect(pickerText).toContain('Bug')
  expect(getNodeByName(pickerDom, 'cardLabelCheckbox:label-1')).toMatchObject({
    checked: true,
    inputType: 'checkbox',
  })

  await instance.handleEvent?.({ name: 'addCardLabel:label-2', type: 'click' })

  const failedDom = await instance.render()
  expect(getText(failedDom)).toContain('gpt-voice request failed: 500 unavailable')
  expect(getNodeByName(failedDom, 'cardLabelPicker')).toBeDefined()
  expect(getText(failedDom)).not.toContain('No labels available')
  resetgpt-voiceViewDependencyFactory()
})

test('card detail title renders as wrapping textarea with full long title', async () => {
  const longTitle =
    'gpt-voice: input fields on firefox look not so good when the card detail title needs more than one line'
  const instance = await createAuthenticatedInstance(
    [{ id: 'board-1', name: 'Roadmap' }],
    [],
    {
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: longTitle }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: longTitle,
          },
          comments: [],
        },
      },
    },
  )
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardDetailTitleSizer')
  expect(getClassNames(detailDom)).toContain('gpt-voiceCardDetailTitleMirror')
  expect(getText(detailDom)).toContain(longTitle)
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.name === 'cardTitle' &&
        node.type === VirtualDomElements.TextArea &&
        node.rows === 1 &&
        node.value === longTitle &&
        hasClass(node, 'gpt-voiceCardDetailTitleInput')
      )
    }),
  ).toBe(true)
  resetgpt-voiceViewDependencyFactory()
})

test('clicking card renders cached detail before fresh detail resolves', async () => {
  const boardDetail: gpt-voiceBoardDetail = {
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  const cachedCardDetail: gpt-voiceCardDetail = {
    attachments: [],
    card: {
      desc: 'Cached description',
      id: 'card-1',
      name: 'Ship gpt-voice view',
    },
    comments: [],
  }
  const freshCardDetail = {
    ...cachedCardDetail,
    card: {
      ...cachedCardDetail.card,
      desc: 'Fresh description',
    },
  }
  const freshCardDeferred = createDeferred<gpt-voiceCardDetail>()
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const client: gpt-voiceClient = {
    async addCardAttachment(_card: gpt-voiceCard, file: File) {
      return {
        id: 'created-attachment-1',
        mimeType: file.type,
        name: file.name,
      }
    },
    async addCardComment(_card: gpt-voiceCard, text: string) {
      return {
        data: { text },
        id: 'created-comment-1',
      }
    },
    async addCardLabel(card: gpt-voiceCard) {
      return card
    },
    async createCard(list: gpt-voiceList) {
      return {
        id: 'created-card-1',
        idList: list.id,
        name: 'Created card',
      }
    },
    async createLabel(board, create): Promise<gpt-voiceLabel> {
      return {
        color: create.color,
        id: 'created-label-1',
        idBoard: board.id,
        name: create.name,
      }
    },
    async createList(_board: gpt-voiceBoard, create: gpt-voiceListCreate) {
      return {
        cards: [],
        id: 'created-list-1',
        name: create.name,
      }
    },
    async getBoardDetail() {
      return boardDetail
    },
    async getBoardDetailCacheFirst() {
      return {
        cached: undefined,
        fresh: Promise.resolve(boardDetail),
      }
    },
    async getCardDetail() {
      return freshCardDeferred.promise
    },
    async getCardDetailCacheFirst() {
      return {
        cached: cachedCardDetail,
        fresh: freshCardDeferred.promise,
      }
    },
    async getCardDetailPartsCacheFirst() {
      return {
        cached: cachedCardDetail,
        fresh: {
          attachments: getFreshAttachments(freshCardDeferred.promise),
          card: getFreshCard(freshCardDeferred.promise),
          comments: getFreshComments(freshCardDeferred.promise),
        },
      }
    },
    async listBoardLabels() {
      return []
    },
    async listBoards() {
      return boards
    },
    async listBoardsCacheFirst() {
      return {
        cached: undefined,
        fresh: Promise.resolve(boards),
      }
    },
    async moveCard(card: gpt-voiceCard, move: gpt-voiceCardMove) {
      return {
        ...card,
        idList: move.idList,
      }
    },
    async search() {
      return []
    },
    async searchCacheFirst() {
      return {
        cached: undefined,
        fresh: Promise.resolve([]),
      }
    },
    async updateCard(card: gpt-voiceCard, update: gpt-voiceCardUpdate) {
      return {
        ...card,
        ...update,
      }
    },
    async updateList(list: gpt-voiceList, update: gpt-voiceListUpdate) {
      return {
        ...list,
        ...update,
      }
    },
  }
  setgpt-voiceViewDependencyFactory(() => ({
    client,
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const openCardPromise = instance.handleEvent?.({
    name: 'card:card-1',
    type: 'click',
  }) as Promise<void>
  await Promise.resolve()

  expect(getText(await instance.render())).toContain('Cached description')
  freshCardDeferred.resolve(freshCardDetail)
  await openCardPromise

  const refreshedText = getText(await instance.render())
  expect(refreshedText).toContain('Fresh description')
  expect(refreshedText).not.toContain('Cached description')
  resetgpt-voiceViewDependencyFactory()
})

test('fresh comments replace cached comments before fresh card resolves', async () => {
  const cardDeferred = createDeferred<gpt-voiceCard>()
  const commentsDeferred = createDeferred<gpt-voiceCardDetail['comments']>()
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const boardDetail: gpt-voiceBoardDetail = {
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  const cachedCardDetail: gpt-voiceCardDetail = {
    attachments: [],
    card: {
      desc: 'Cached description',
      id: 'card-1',
      name: 'Ship gpt-voice view',
    },
    comments: [],
  }
  setgpt-voiceViewDependencyFactory(() => ({
    client: createStagedCardClient({
      boardDetail,
      boards,
      async getCardDetailPartsCacheFirst() {
        return {
          cached: cachedCardDetail,
          fresh: {
            attachments: Promise.resolve([]),
            card: cardDeferred.promise,
            comments: commentsDeferred.promise,
          },
        }
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  const openCardPromise = instance.handleEvent?.({
    name: 'card:card-1',
    type: 'click',
  }) as Promise<void>
  await Promise.resolve()

  commentsDeferred.resolve([
    {
      data: {
        text: 'Fresh comment',
      },
      id: 'comment-1',
    },
  ])
  await Promise.resolve()
  await Promise.resolve()

  const commentsText = getText(await instance.render())
  expect(commentsText).toContain('Fresh comment')
  expect(commentsText).not.toContain('Loading comments...')

  cardDeferred.resolve({
    desc: 'Fresh description',
    id: 'card-1',
    name: 'Ship gpt-voice view',
  })
  await openCardPromise
  resetgpt-voiceViewDependencyFactory()
})

test('card detail renders title and description before comments finish loading', async () => {
  const cardDeferred = createDeferred<gpt-voiceCard>()
  const commentsDeferred = createDeferred<gpt-voiceCardDetail['comments']>()
  const attachmentsDeferred = createDeferred<gpt-voiceCardDetail['attachments']>()
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const boardDetail = {
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  setgpt-voiceViewDependencyFactory(() => ({
    client: createStagedCardClient({
      boardDetail,
      boards,
      async getCardDetailPartsCacheFirst() {
        return {
          cached: undefined,
          fresh: {
            attachments: attachmentsDeferred.promise,
            card: cardDeferred.promise,
            comments: commentsDeferred.promise,
          },
        }
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  const openCardPromise = instance.handleEvent?.({
    name: 'card:card-1',
    type: 'click',
  }) as Promise<void>

  cardDeferred.resolve({
    desc: 'Fresh staged description',
    id: 'card-1',
    name: 'Fresh staged title',
  })
  await Promise.resolve()
  await Promise.resolve()

  const stagedText = getText(await instance.render())
  expect(stagedText).toContain('Fresh staged title')
  expect(stagedText).toContain('Fresh staged description')
  expect(stagedText).toContain('Loading comments...')
  expect(stagedText).toContain('Loading images...')
  expect(stagedText).not.toContain('A staged comment')

  commentsDeferred.resolve([
    {
      data: {
        text: 'A staged comment',
      },
      id: 'comment-1',
    },
  ])
  attachmentsDeferred.resolve([])
  await openCardPromise

  const finishedText = getText(await instance.render())
  expect(finishedText).toContain('A staged comment')
  expect(finishedText).not.toContain('Loading comments...')
  resetgpt-voiceViewDependencyFactory()
})

test('late comments do not reset edited card description draft', async () => {
  const cardDeferred = createDeferred<gpt-voiceCard>()
  const commentsDeferred = createDeferred<gpt-voiceCardDetail['comments']>()
  const attachmentsDeferred = createDeferred<gpt-voiceCardDetail['attachments']>()
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const boardDetail = {
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  setgpt-voiceViewDependencyFactory(() => ({
    client: createStagedCardClient({
      boardDetail,
      boards,
      async getCardDetailPartsCacheFirst() {
        return {
          cached: undefined,
          fresh: {
            attachments: attachmentsDeferred.promise,
            card: cardDeferred.promise,
            comments: commentsDeferred.promise,
          },
        }
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  const openCardPromise = instance.handleEvent?.({
    name: 'card:card-1',
    type: 'click',
  }) as Promise<void>
  cardDeferred.resolve({
    desc: 'Original staged description',
    id: 'card-1',
    name: 'Fresh staged title',
  })
  await Promise.resolve()
  await Promise.resolve()

  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Draft while comments load',
  })
  commentsDeferred.resolve([
    {
      data: {
        text: 'Late comment',
      },
      id: 'comment-1',
    },
  ])
  attachmentsDeferred.resolve([])
  await openCardPromise

  const dom = await instance.render()
  expect(getNodeByName(dom, 'cardDescription')?.value).toBe(
    'Draft while comments load',
  )
  expect(getText(dom)).toContain('Late comment')
  resetgpt-voiceViewDependencyFactory()
})

test('stale staged card detail results are ignored after opening another card', async () => {
  const cardOneDeferred = createDeferred<gpt-voiceCard>()
  const cardTwoDeferred = createDeferred<gpt-voiceCard>()
  const commentsOneDeferred = createDeferred<gpt-voiceCardDetail['comments']>()
  const commentsTwoDeferred = createDeferred<gpt-voiceCardDetail['comments']>()
  const attachmentsOneDeferred =
    createDeferred<gpt-voiceCardDetail['attachments']>()
  const attachmentsTwoDeferred =
    createDeferred<gpt-voiceCardDetail['attachments']>()
  const boards = [{ id: 'board-1', name: 'Roadmap' }]
  const boardDetail = {
    board: { id: 'board-1', name: 'Roadmap' },
    lists: [
      {
        cards: [
          { id: 'card-1', name: 'First card' },
          { id: 'card-2', name: 'Second card' },
        ],
        id: 'list-1',
        name: 'Todo',
      },
    ],
  }
  setgpt-voiceViewDependencyFactory(() => ({
    client: createStagedCardClient({
      boardDetail,
      boards,
      async getCardDetailPartsCacheFirst(card) {
        const isFirstCard = card.id === 'card-1'
        return {
          cached: undefined,
          fresh: {
            attachments: (isFirstCard
              ? attachmentsOneDeferred
              : attachmentsTwoDeferred
            ).promise,
            card: (isFirstCard ? cardOneDeferred : cardTwoDeferred).promise,
            comments: (isFirstCard ? commentsOneDeferred : commentsTwoDeferred)
              .promise,
          },
        }
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  const openFirstCardPromise = instance.handleEvent?.({
    name: 'card:card-1',
    type: 'click',
  }) as Promise<void>
  await Promise.resolve()
  const openSecondCardPromise = instance.handleEvent?.({
    name: 'card:card-2',
    type: 'click',
  }) as Promise<void>

  cardOneDeferred.resolve({
    desc: 'First stale description',
    id: 'card-1',
    name: 'First stale title',
  })
  commentsOneDeferred.resolve([
    {
      data: {
        text: 'First stale comment',
      },
      id: 'comment-1',
    },
  ])
  attachmentsOneDeferred.resolve([])
  cardTwoDeferred.resolve({
    desc: 'Second current description',
    id: 'card-2',
    name: 'Second current title',
  })
  commentsTwoDeferred.resolve([
    {
      data: {
        text: 'Second current comment',
      },
      id: 'comment-2',
    },
  ])
  attachmentsTwoDeferred.resolve([])
  await Promise.all([openFirstCardPromise, openSecondCardPromise])

  const text = getText(await instance.render())
  expect(text).toContain('Second current description')
  expect(text).toContain('Second current comment')
  expect(text).not.toContain('First stale description')
  expect(text).not.toContain('First stale comment')
  resetgpt-voiceViewDependencyFactory()
})

test('editing card title and description saves card detail', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: 'Original description',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const initialDom = await instance.render()
  expect(
    hasNode(initialDom, (node) => {
      return node.name === 'cardTitle' && node.value === 'Ship gpt-voice view'
    }),
  ).toBe(true)
  expect(
    hasNode(initialDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)
  expect(
    hasNode(initialDom, (node) => {
      return node.name === 'saveCardDetail'
    }),
  ).toBe(false)

  await instance.handleEvent?.({
    name: 'cardTitle',
    type: 'input',
    value: 'Updated title',
  })
  await instance.handleEvent?.({ name: 'cardTitle', type: 'blur' })
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })

  const editingDom = await instance.render()
  expect(
    hasNode(editingDom, (node) => {
      return (
        node.name === 'cardDescription' && node.value === 'Original description'
      )
    }),
  ).toBe(true)
  expect(
    hasNode(editingDom, (node) => {
      return node.name === 'saveCardDetail'
    }),
  ).toBe(true)
  expect(
    hasNode(editingDom, (node) => {
      return node.name === 'cancelCardDescriptionEdit'
    }),
  ).toBe(true)

  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Discarded description',
  })
  await instance.handleEvent?.({
    name: 'cancelCardDescriptionEdit',
    type: 'click',
  })

  const cancelledDom = await instance.render()
  expect(getText(cancelledDom)).toContain('Original description')
  expect(getText(cancelledDom)).not.toContain('Discarded description')
  expect(
    hasNode(cancelledDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)

  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })

  await instance.handleEvent?.({
    name: 'cardDescription',
    type: 'input',
    value: 'Updated description',
  })
  await instance.handleEvent?.({ name: 'cardDescription', type: 'blur' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Updated title')
  expect(text).toContain('Updated description')
  expect(text).not.toContain('Original description')
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardTitle' && node.value === 'Updated title'
    }),
  ).toBe(true)
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)
  resetgpt-voiceViewDependencyFactory()
})

test('unchanged card description blur closes editor without saving', async () => {
  let updateCardCallCount = 0
  const client = createMockgpt-voiceClient({
    boardDetails: {
      'board-1': {
        board: { id: 'board-1', name: 'Roadmap' },
        lists: [
          {
            cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
            id: 'list-1',
            name: 'Todo',
          },
        ],
      },
    },
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    cardDetails: {
      'card-1': {
        attachments: [],
        card: {
          desc: 'Original description',
          id: 'card-1',
          name: 'Ship gpt-voice view',
        },
        comments: [],
      },
    },
  })
  setgpt-voiceViewDependencyFactory(() => ({
    client: {
      ...client,
      async updateCard(
        card: gpt-voiceCard,
        update: gpt-voiceCardUpdate,
        credentials: gpt-voiceCredentials,
      ): Promise<gpt-voiceCard> {
        updateCardCallCount++
        return client.updateCard(card, update, credentials)
      },
    },
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({ name: 'editCardDescription', type: 'click' })
  await instance.handleEvent?.({ name: 'cardDescription', type: 'blur' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Original description')
  expect(updateCardCallCount).toBe(0)
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardDescription'
    }),
  ).toBe(false)
  resetgpt-voiceViewDependencyFactory()
})

test('card description preview renders safe markdown subset', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '# Heading\n\n- **Bold** item\n- [Link](https://example.com)\n\nUse `code` and *emphasis*\n\nEscaped \\- hyphen',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })

  const detailDom = await instance.render()
  const text = getText(detailDom)
  expect(text).toContain('Heading')
  expect(text).toContain('Escaped - hyphen')
  expect(text).not.toContain('Escaped \\- hyphen')
  expect(getClassNames(detailDom)).toContain(
    'gpt-voiceMarkdownHeading gpt-voiceMarkdownHeading1',
  )
  expect(getClassNames(detailDom)).toContain('gpt-voiceMarkdownList')
  expect(getClassNames(detailDom)).toContain('gpt-voiceMarkdownStrong')
  expect(getClassNames(detailDom)).toContain('gpt-voiceMarkdownCode')
  expect(
    hasNode(detailDom, (node) => {
      return (
        node.className === 'gpt-voiceMarkdownLink' &&
        node.href === 'https://example.com' &&
        node.target === '_blank'
      )
    }),
  ).toBe(true)
  resetgpt-voiceViewDependencyFactory()
})

test('empty card title on blur restores saved title and shows validation error', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boardDetails: {
        'board-1': {
          board: { id: 'board-1', name: 'Roadmap' },
          lists: [
            {
              cards: [{ id: 'card-1', name: 'Ship gpt-voice view' }],
              id: 'list-1',
              name: 'Todo',
            },
          ],
        },
      },
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      cardDetails: {
        'card-1': {
          attachments: [],
          card: {
            desc: '',
            id: 'card-1',
            name: 'Ship gpt-voice view',
          },
          comments: [],
        },
      },
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })
  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })
  await instance.handleEvent?.({ name: 'card:card-1', type: 'click' })
  await instance.handleEvent?.({
    name: 'cardTitle',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'cardTitle', type: 'blur' })

  const detailDom = await instance.render()
  expect(getText(detailDom)).toContain('Card title is required.')
  expect(
    hasNode(detailDom, (node) => {
      return node.name === 'cardTitle' && node.value === 'Ship gpt-voice view'
    }),
  ).toBe(true)
  resetgpt-voiceViewDependencyFactory()
})

test('connect shows validation error for missing credentials', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({}),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  expect(getText(await instance.render())).toContain(
    'Enter an API key and token.',
  )
  resetgpt-voiceViewDependencyFactory()
})

test('connect shows validation error for invalid api key shape', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: 'bad-key',
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('API key must be 32 alphanumeric characters.')
  expect(text).toContain('API key')
  expect(text).not.toContain('Roadmap')
  resetgpt-voiceViewDependencyFactory()
})

test('connect accepts 76 character token and loads boards', async () => {
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      boards: [{ id: 'board-1', name: 'Roadmap' }],
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage: createMemoryCredentialStorage(),
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validLongToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('Roadmap')
  expect(text).not.toContain('Welcome to gpt-voice')
  resetgpt-voiceViewDependencyFactory()
})

test('connect shows gpt-voice error on auth form when credentials fail', async () => {
  const storage = createMemoryCredentialStorage()
  setgpt-voiceViewDependencyFactory(() => ({
    client: createMockgpt-voiceClient({
      listBoardsError: 'gpt-voice request failed: 401 invalid key',
    }),
    recentStorage: createMemoryRecentBoardStorage(),
    storage,
  }))

  const instance = (await view.create()) as VirtualDomViewInstance
  await instance.handleEvent?.({
    name: 'apiKey',
    type: 'input',
    value: validApiKey,
  })
  await instance.handleEvent?.({
    name: 'token',
    type: 'input',
    value: validToken,
  })
  await instance.handleEvent?.({ name: 'connect', type: 'click' })

  const text = getText(await instance.render())
  expect(text).toContain('gpt-voice request failed: 401 invalid key')
  expect(text).toContain('API key')
  await expect(storage.read()).resolves.toBeUndefined()
  resetgpt-voiceViewDependencyFactory()
})

test('renders recently viewed before workspaces', async () => {
  const instance = await createAuthenticatedInstance([
    {
      dateLastView: '2026-01-02T00:00:00.000Z',
      id: 'board-1',
      name: 'Roadmap',
      organization: {
        displayName: 'Engineering',
        id: 'org-1',
        name: 'engineering',
      },
    },
  ])

  const text = getText(await instance.render())
  expect(text.indexOf('Recently viewed')).toBeLessThan(
    text.indexOf('Your workspaces'),
  )
  resetgpt-voiceViewDependencyFactory()
})

test('orders recently viewed boards by gpt-voice dateLastView', async () => {
  const instance = await createAuthenticatedInstance([
    {
      dateLastView: '2026-01-01T00:00:00.000Z',
      id: 'board-1',
      name: 'Older',
    },
    {
      dateLastView: '2026-01-03T00:00:00.000Z',
      id: 'board-2',
      name: 'Newer',
    },
  ])

  expect(getBoardButtonLabels(await instance.render()).slice(0, 2)).toEqual([
    'Newer',
    'Older',
  ])
  resetgpt-voiceViewDependencyFactory()
})

test('local recent board views override missing gpt-voice dates', async () => {
  const instance = await createAuthenticatedInstance([
    {
      dateLastView: '2026-01-01T00:00:00.000Z',
      id: 'board-1',
      name: 'Previously viewed',
    },
    {
      id: 'board-2',
      name: 'Opened locally',
    },
  ])

  await instance.handleEvent?.({ name: 'board:board-2', type: 'click' })
  await instance.handleEvent?.({ name: 'backToBoards', type: 'click' })

  expect(getBoardButtonLabels(await instance.render()).slice(0, 2)).toEqual([
    'Opened locally',
    'Previously viewed',
  ])
  resetgpt-voiceViewDependencyFactory()
})

test('groups boards by workspace with personal fallback', async () => {
  const instance = await createAuthenticatedInstance([
    {
      id: 'board-1',
      name: 'Team board',
      organization: {
        displayName: 'Product',
        id: 'org-1',
        name: 'product',
      },
    },
    {
      id: 'board-2',
      name: 'Personal board',
    },
  ])

  const text = getText(await instance.render())
  expect(text).toContain('Product')
  expect(text).toContain('Personal boards')
  resetgpt-voiceViewDependencyFactory()
})

test('renders empty board state', async () => {
  const instance = await createAuthenticatedInstance([])

  expect(getText(await instance.render())).toContain('No boards found')
  resetgpt-voiceViewDependencyFactory()
})

test('does not use gpt-voice board background when flag is disabled', async () => {
  const instance = await createAuthenticatedInstance([
    {
      id: 'board-1',
      name: 'Roadmap',
      prefs: {
        backgroundImage: 'https://example.com/background.jpg',
      },
    },
  ])

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'gpt-voiceBoardDetail',
  )
  expect(hasClass(boardDetail, 'gpt-voiceBoardDetailWithBackground')).toBe(false)
  expect(boardDetail.style).toBeUndefined()
  resetgpt-voiceViewDependencyFactory()
})

test('uses largest gpt-voice board background image when flag is enabled', async () => {
  const instance = await createAuthenticatedInstance(
    [
      {
        id: 'board-1',
        name: 'Roadmap',
        prefs: {
          backgroundImage: 'https://example.com/original.jpg',
          backgroundImageScaled: [
            {
              height: 120,
              url: 'https://example.com/small.jpg',
              width: 160,
            },
            {
              height: 1080,
              url: 'https://example.com/large.jpg',
              width: 1920,
            },
          ],
        },
      },
    ],
    [],
    {
      boardBackgroundEnabled: true,
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'gpt-voiceBoardDetail',
  )
  expect(hasClass(boardDetail, 'gpt-voiceBoardDetailWithBackground')).toBe(true)
  expect(boardDetail.style).toBeUndefined()
  const css = instance.getCss()
  expect(css).toContain(
    '--gpt-voiceBoardBackgroundImage: url("https://example.com/large.jpg")',
  )
  expect(css).toContain('--gpt-voiceBoardBackgroundRepeat: no-repeat')
  expect(css).toContain('--gpt-voiceBoardBackgroundSize: cover')
  resetgpt-voiceViewDependencyFactory()
})

test('uses gpt-voice board background color when no image exists', async () => {
  const instance = await createAuthenticatedInstance(
    [
      {
        id: 'board-1',
        name: 'Roadmap',
        prefs: {
          backgroundBottomColor: '#0c66e4',
        },
      },
    ],
    [],
    {
      boardBackgroundEnabled: true,
    },
  )

  await instance.handleEvent?.({ name: 'board:board-1', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'gpt-voiceBoardDetail',
  )
  expect(hasClass(boardDetail, 'gpt-voiceBoardDetailWithBackground')).toBe(true)
  expect(boardDetail.style).toBeUndefined()
  expect(instance.getCss()).toContain('--gpt-voiceBoardBackgroundColor: #0c66e4')
  resetgpt-voiceViewDependencyFactory()
})

test('does not render search when flag is disabled', async () => {
  const instance = await createAuthenticatedInstance([
    { id: 'board-1', name: 'Roadmap' },
  ])

  expect(getClassNames(await instance.render())).not.toContain(
    'gpt-voiceSearchForm',
  )
  resetgpt-voiceViewDependencyFactory()
})

test('renders search when flag is enabled', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
  })

  expect(getClassNames(await instance.render())).toContain('gpt-voiceSearchForm')
  expect(getText(await instance.render())).toContain('Roadmap')
  resetgpt-voiceViewDependencyFactory()
})

test('submitting search renders card and board results', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchResults: [
      {
        id: 'card-1',
        idBoard: 'board-1',
        name: 'Ship gpt-voice search',
        type: 'card',
      },
      {
        id: 'board-2',
        name: 'Search Board',
        type: 'board',
      },
    ],
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'ship',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })

  const text = getText(await instance.render())
  expect(text).toContain('Search results for "ship"')
  expect(text).toContain('Card: Ship gpt-voice search')
  expect(text).toContain('Board: Search Board')
  resetgpt-voiceViewDependencyFactory()
})

test('submitting empty search clears search results', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchResults: [
      {
        id: 'card-1',
        name: 'Ship gpt-voice search',
        type: 'card',
      },
    ],
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'ship',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })
  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: ' '.repeat(3),
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })

  const text = getText(await instance.render())
  expect(text).toContain('Roadmap')
  expect(text).not.toContain('Search results for "ship"')
  resetgpt-voiceViewDependencyFactory()
})

test('search errors reuse gpt-voice error rendering', async () => {
  const instance = await createSearchEnabledInstance({
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchError: 'gpt-voice request failed: 401 unauthorized',
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'ship',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })

  expect(getText(await instance.render())).toContain(
    'gpt-voice request failed: 401 unauthorized',
  )
  resetgpt-voiceViewDependencyFactory()
})

test('clicking board search result opens board detail', async () => {
  const instance = await createSearchEnabledInstance({
    boardDetails: {
      'board-2': {
        board: { id: 'board-2', name: 'Search Board' },
        lists: [
          {
            cards: [{ id: 'card-1', name: 'Found card' }],
            id: 'list-1',
            name: 'Todo',
          },
        ],
      },
    },
    boards: [{ id: 'board-1', name: 'Roadmap' }],
    searchResults: [
      {
        id: 'board-2',
        name: 'Search Board',
        type: 'board',
      },
    ],
  })

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'search board',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })
  await instance.handleEvent?.({ name: 'board:board-2', type: 'click' })

  const dom = await instance.render()
  const text = getText(dom)
  expect(getListTitleInput(dom, 'list-1')?.value).toBe('Todo')
  expect(text).toContain('Found card')
  resetgpt-voiceViewDependencyFactory()
})

test('uses gpt-voice background for board opened from search', async () => {
  const instance = await createSearchEnabledInstance(
    {
      boards: [{ id: 'board-1', name: 'Roadmap' }],
      searchResults: [
        {
          id: 'board-2',
          name: 'Search Board',
          prefs: {
            backgroundImage: 'https://example.com/search-board.jpg',
            backgroundTile: true,
          },
          type: 'board',
        },
      ],
    },
    {
      boardBackgroundEnabled: true,
    },
  )

  await instance.handleEvent?.({
    name: 'search',
    type: 'input',
    value: 'search board',
  })
  await instance.handleEvent?.({ name: 'search', type: 'submit' })
  await instance.handleEvent?.({ name: 'board:board-2', type: 'click' })

  const boardDetail = getNodeByClass(
    await instance.render(),
    'gpt-voiceBoardDetail',
  )
  expect(hasClass(boardDetail, 'gpt-voiceBoardDetailWithBackground')).toBe(true)
  expect(boardDetail.style).toBeUndefined()
  const css = instance.getCss()
  expect(css).toContain(
    '--gpt-voiceBoardBackgroundImage: url("https://example.com/search-board.jpg")',
  )
  expect(css).toContain('--gpt-voiceBoardBackgroundRepeat: repeat')
  expect(css).toContain('--gpt-voiceBoardBackgroundSize: auto')
  resetgpt-voiceViewDependencyFactory()
})
