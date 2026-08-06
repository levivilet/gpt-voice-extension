import type { gpt-voiceClient } from '../gpt-voiceClient/gpt-voiceClient.ts'
import type { gpt-voiceCacheFirstResult } from '../gpt-voiceClientTypes/gpt-voiceClientTypes.ts'
import type {
  gpt-voiceAttachment,
  gpt-voiceBoard,
  gpt-voiceBoardDetail,
  gpt-voiceCard,
  gpt-voiceCardCreate,
  gpt-voiceCardDetail,
  gpt-voiceCardMove,
  gpt-voiceCardUpdate,
  gpt-voiceComment,
  gpt-voiceCredentials,
  gpt-voiceLabel,
  gpt-voiceLabelCreate,
  gpt-voiceList,
  gpt-voiceListCreate,
  gpt-voiceListUpdate,
  gpt-voiceSearchResult,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'

export interface Mockgpt-voiceData {
  readonly boardDetailErrors?: Readonly<Record<string, string>>
  readonly boardDetails?: Readonly<Record<string, gpt-voiceBoardDetail>>
  readonly boardLabels?: Readonly<Record<string, readonly gpt-voiceLabel[]>>
  readonly boards?: readonly gpt-voiceBoard[]
  readonly cardAttachmentAddErrors?: Readonly<Record<string, string>>
  readonly cardCommentAddErrors?: Readonly<Record<string, string>>
  readonly cardCreateErrors?: Readonly<Record<string, string>>
  readonly cardDetailErrors?: Readonly<Record<string, string>>
  readonly cardDetails?: Readonly<Record<string, gpt-voiceCardDetail>>
  readonly cardLabelAddErrors?: Readonly<Record<string, string>>
  readonly cardMoveErrors?: Readonly<Record<string, string>>
  readonly cardUpdateErrors?: Readonly<Record<string, string>>
  readonly error?: string
  readonly listBoardsError?: string
  readonly listBoardsResponses?: readonly (readonly gpt-voiceBoard[])[]
  readonly listCreateErrors?: Readonly<Record<string, string>>
  readonly listUpdateErrors?: Readonly<Record<string, string>>
  readonly searchError?: string
  readonly searchResults?: readonly gpt-voiceSearchResult[]
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

export const createMockgpt-voiceClient = (
  data: Readonly<Mockgpt-voiceData>,
): gpt-voiceClient => {
  let listBoardsCallCount = 0
  let addAttachmentCallCount = 0
  let addCommentCallCount = 0
  let createCardCallCount = 0
  let createLabelCallCount = 0
  let createListCallCount = 0
  const cardDetails: Record<string, gpt-voiceCardDetail> = {
    ...data.cardDetails,
  }
  const boardDetails: Record<string, gpt-voiceBoardDetail> = {
    ...data.boardDetails,
  }
  const boardLabels: Record<string, readonly gpt-voiceLabel[]> = {
    ...data.boardLabels,
  }
  const findCard = (cardId: string): gpt-voiceCard | undefined => {
    const details = Object.values(boardDetails)
    for (const detail of details) {
      for (const list of detail.lists) {
        const card = list.cards.find((item) => item.id === cardId)
        if (card) {
          return card
        }
      }
    }
    return undefined
  }

  const client: gpt-voiceClient = {
    async addCardAttachment(
      card: gpt-voiceCard,
      file: File,
    ): Promise<gpt-voiceAttachment> {
      if (data.error) {
        throw new Error(data.error)
      }
      const addError = data.cardAttachmentAddErrors?.[card.id]
      if (addError) {
        throw new Error(addError)
      }
      addAttachmentCallCount++
      const attachment: gpt-voiceAttachment = {
        id: `created-attachment-${addAttachmentCallCount}`,
        mimeType: file.type,
        name: file.name,
        url: `https://example.com/${encodeURIComponent(file.name)}`,
      }
      const previousDetail = cardDetails[card.id]
      cardDetails[card.id] = {
        attachments: [...(previousDetail?.attachments || []), attachment],
        card: previousDetail?.card || findCard(card.id) || card,
        comments: previousDetail?.comments || [],
      }
      return attachment
    },
    async addCardComment(
      card: gpt-voiceCard,
      text: string,
    ): Promise<gpt-voiceComment> {
      if (data.error) {
        throw new Error(data.error)
      }
      const addError = data.cardCommentAddErrors?.[card.id]
      if (addError) {
        throw new Error(addError)
      }
      addCommentCallCount++
      const comment: gpt-voiceComment = {
        data: {
          text,
        },
        date: '2026-07-07T12:00:00.000Z',
        id: `created-comment-${addCommentCallCount}`,
        memberCreator: {
          fullName: 'Test User',
          initials: 'TU',
        },
      }
      const previousDetail = cardDetails[card.id]
      if (previousDetail) {
        cardDetails[card.id] = {
          ...previousDetail,
          comments: [...previousDetail.comments, comment],
        }
      }
      return comment
    },
    async addCardLabel(
      card: gpt-voiceCard,
      label: gpt-voiceLabel,
      _credentials: gpt-voiceCredentials,
    ): Promise<gpt-voiceCard> {
      if (data.error) {
        throw new Error(data.error)
      }
      const addError = data.cardLabelAddErrors?.[card.id]
      if (addError) {
        throw new Error(addError)
      }
      const previousDetail = cardDetails[card.id]
      const previousCard = previousDetail?.card || findCard(card.id) || card
      const labels = previousCard.labels?.some((item) => {
        return item.id === label.id
      })
        ? previousCard.labels
        : [...(previousCard.labels || []), label]
      const updatedCard = {
        ...previousCard,
        labels,
      }
      cardDetails[card.id] = {
        attachments: previousDetail?.attachments || [],
        card: updatedCard,
        comments: previousDetail?.comments || [],
      }
      for (const [boardId, detail] of Object.entries(boardDetails)) {
        boardDetails[boardId] = {
          ...detail,
          lists: detail.lists.map((list) => {
            return {
              ...list,
              cards: list.cards.map((item) => {
                return item.id === card.id ? { ...item, ...updatedCard } : item
              }),
            }
          }),
        }
      }
      return updatedCard
    },
    async createCard(
      list: gpt-voiceList,
      create: gpt-voiceCardCreate,
    ): Promise<gpt-voiceCard> {
      if (data.error) {
        throw new Error(data.error)
      }
      const createError = data.cardCreateErrors?.[list.id]
      if (createError) {
        throw new Error(createError)
      }
      createCardCallCount++
      const createdCard: gpt-voiceCard = {
        badges: {
          comments: 0,
        },
        id: `created-card-${createCardCallCount}`,
        idList: list.id,
        name: create.name,
      }
      for (const [boardId, detail] of Object.entries(boardDetails)) {
        const hasList = detail.lists.some((item) => {
          return item.id === list.id
        })
        if (!hasList) {
          continue
        }
        boardDetails[boardId] = {
          ...detail,
          lists: detail.lists.map((item) => {
            if (item.id !== list.id) {
              return item
            }
            return {
              ...item,
              cards: [...item.cards, createdCard],
            }
          }),
        }
      }
      cardDetails[createdCard.id] = {
        attachments: [],
        card: createdCard,
        comments: [],
      }
      return createdCard
    },
    async createLabel(
      board: gpt-voiceBoard,
      create: gpt-voiceLabelCreate,
    ): Promise<gpt-voiceLabel> {
      if (data.error) {
        throw new Error(data.error)
      }
      createLabelCallCount++
      const createdLabel: gpt-voiceLabel = {
        color: create.color,
        id: `created-label-${createLabelCallCount}`,
        idBoard: board.id,
        name: create.name,
      }
      boardLabels[board.id] = [...(boardLabels[board.id] || []), createdLabel]
      return createdLabel
    },
    async createList(
      board: gpt-voiceBoard,
      create: gpt-voiceListCreate,
    ): Promise<gpt-voiceList> {
      if (data.error) {
        throw new Error(data.error)
      }
      const createError = data.listCreateErrors?.[board.id]
      if (createError) {
        throw new Error(createError)
      }
      createListCallCount++
      const createdList: gpt-voiceList = {
        cards: [],
        id: `created-list-${createListCallCount}`,
        name: create.name,
      }
      const detail = boardDetails[board.id]
      if (detail) {
        boardDetails[board.id] = {
          ...detail,
          lists: [...detail.lists, createdList],
        }
      }
      return createdList
    },
    async getBoardDetail(board: gpt-voiceBoard): Promise<gpt-voiceBoardDetail> {
      if (data.error) {
        throw new Error(data.error)
      }
      const detailError = data.boardDetailErrors?.[board.id]
      if (detailError) {
        throw new Error(detailError)
      }
      const detail = boardDetails[board.id]
      if (!detail) {
        return {
          board,
          lists: [],
        }
      }
      return detail
    },
    async getBoardDetailCacheFirst(
      board: gpt-voiceBoard,
    ): Promise<gpt-voiceCacheFirstResult<gpt-voiceBoardDetail>> {
      return {
        cached: undefined,
        fresh: client.getBoardDetail(board, {
          apiKey: '',
          token: '',
        }),
      }
    },
    async getCardDetail(card: gpt-voiceCard): Promise<gpt-voiceCardDetail> {
      if (data.error) {
        throw new Error(data.error)
      }
      const detailError = data.cardDetailErrors?.[card.id]
      if (detailError) {
        throw new Error(detailError)
      }
      const detail = cardDetails[card.id]
      if (detail) {
        return {
          ...detail,
          comments: detail.comments || [],
        }
      }
      return {
        attachments: [],
        card: findCard(card.id) || card,
        comments: [],
      }
    },
    async getCardDetailCacheFirst(
      card: gpt-voiceCard,
    ): Promise<gpt-voiceCacheFirstResult<gpt-voiceCardDetail>> {
      return {
        cached: undefined,
        fresh: client.getCardDetail(card, {
          apiKey: '',
          token: '',
        }),
      }
    },
    async getCardDetailPartsCacheFirst(card: gpt-voiceCard) {
      const fresh = client.getCardDetail(card, {
        apiKey: '',
        token: '',
      })
      return {
        cached: undefined,
        fresh: {
          attachments: getFreshAttachments(fresh),
          card: getFreshCard(fresh),
          comments: getFreshComments(fresh),
        },
      }
    },
    async listBoardLabels(board: gpt-voiceBoard): Promise<readonly gpt-voiceLabel[]> {
      if (data.error) {
        throw new Error(data.error)
      }
      return boardLabels[board.id] || []
    },
    async listBoards(): Promise<readonly gpt-voiceBoard[]> {
      if (data.error) {
        throw new Error(data.error)
      }
      if (data.listBoardsError) {
        throw new Error(data.listBoardsError)
      }
      const scriptedResponse = data.listBoardsResponses?.[listBoardsCallCount]
      listBoardsCallCount++
      if (scriptedResponse) {
        return scriptedResponse
      }
      return data.boards || []
    },
    async listBoardsCacheFirst(): Promise<
      gpt-voiceCacheFirstResult<readonly gpt-voiceBoard[]>
    > {
      return {
        cached: undefined,
        fresh: client.listBoards({
          apiKey: '',
          token: '',
        }),
      }
    },
    async moveCard(
      card: gpt-voiceCard,
      move: gpt-voiceCardMove,
    ): Promise<gpt-voiceCard> {
      if (data.error) {
        throw new Error(data.error)
      }
      const moveError = data.cardMoveErrors?.[card.id]
      if (moveError) {
        throw new Error(moveError)
      }
      const existingCard = findCard(card.id) || card
      const movedCard = {
        ...existingCard,
        idList: move.idList,
      }
      for (const [boardId, detail] of Object.entries(boardDetails)) {
        const hasCard = detail.lists.some((list) => {
          return list.cards.some((item) => item.id === card.id)
        })
        if (!hasCard) {
          continue
        }
        boardDetails[boardId] = {
          ...detail,
          lists: detail.lists.map((list) => {
            const cardsWithoutMoved = list.cards.filter((item) => {
              return item.id !== card.id
            })
            if (list.id !== move.idList) {
              return {
                ...list,
                cards: cardsWithoutMoved,
              }
            }
            return {
              ...list,
              cards:
                move.pos === 'top'
                  ? [movedCard, ...cardsWithoutMoved]
                  : [...cardsWithoutMoved, movedCard],
            }
          }),
        }
      }
      const previousDetail = cardDetails[card.id]
      if (previousDetail) {
        cardDetails[card.id] = {
          ...previousDetail,
          card: {
            ...previousDetail.card,
            idList: move.idList,
          },
        }
      }
      return movedCard
    },
    async search(): Promise<readonly gpt-voiceSearchResult[]> {
      if (data.error) {
        throw new Error(data.error)
      }
      if (data.searchError) {
        throw new Error(data.searchError)
      }
      return data.searchResults || []
    },
    async searchCacheFirst(): Promise<
      gpt-voiceCacheFirstResult<readonly gpt-voiceSearchResult[]>
    > {
      return {
        cached: undefined,
        fresh: client.search('', {
          apiKey: '',
          token: '',
        }),
      }
    },
    async updateCard(
      card: gpt-voiceCard,
      update: gpt-voiceCardUpdate,
    ): Promise<gpt-voiceCard> {
      if (data.error) {
        throw new Error(data.error)
      }
      const updateError = data.cardUpdateErrors?.[card.id]
      if (updateError) {
        throw new Error(updateError)
      }
      const previousDetail = cardDetails[card.id]
      const previousCard = previousDetail?.card || findCard(card.id) || card
      const updatedCard = {
        ...previousCard,
        desc: update.desc,
        name: update.name,
      }
      cardDetails[card.id] = {
        attachments: previousDetail?.attachments || [],
        card: updatedCard,
        comments: previousDetail?.comments || [],
      }
      return updatedCard
    },
    async updateList(
      list: gpt-voiceList,
      update: gpt-voiceListUpdate,
    ): Promise<gpt-voiceList> {
      if (data.error) {
        throw new Error(data.error)
      }
      const updateError = data.listUpdateErrors?.[list.id]
      if (updateError) {
        throw new Error(updateError)
      }
      const updatedList = {
        ...list,
        name: update.name,
      }
      for (const [boardId, detail] of Object.entries(boardDetails)) {
        boardDetails[boardId] = {
          ...detail,
          lists: detail.lists.map((item) => {
            return item.id === list.id ? updatedList : item
          }),
        }
      }
      return updatedList
    },
  }
  return client
}
