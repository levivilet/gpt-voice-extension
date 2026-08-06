import type {
  gpt-voiceBoard,
  gpt-voiceBoardDetail,
  gpt-voiceAttachment,
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

export interface gpt-voiceCacheFirstResult<T> {
  readonly cached: T | undefined
  readonly fresh: Promise<T>
}

export interface gpt-voiceCardDetailPartsResult {
  readonly cached: gpt-voiceCardDetail | undefined
  readonly fresh: {
    readonly attachments: Promise<gpt-voiceCardDetail['attachments']>
    readonly card: Promise<gpt-voiceCard>
    readonly comments: Promise<gpt-voiceCardDetail['comments']>
  }
}

export interface gpt-voiceClient {
  readonly addCardAttachment: (
    card: gpt-voiceCard,
    file: File,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceAttachment>
  readonly addCardComment: (
    card: gpt-voiceCard,
    text: string,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceComment>
  readonly addCardLabel: (
    card: gpt-voiceCard,
    label: gpt-voiceLabel,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCard>
  readonly createCard: (
    list: gpt-voiceList,
    create: gpt-voiceCardCreate,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCard>
  readonly createLabel: (
    board: gpt-voiceBoard,
    create: gpt-voiceLabelCreate,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceLabel>
  readonly createList: (
    board: gpt-voiceBoard,
    create: gpt-voiceListCreate,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceList>
  readonly getBoardDetail: (
    board: gpt-voiceBoard,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceBoardDetail>
  readonly getBoardDetailCacheFirst: (
    board: gpt-voiceBoard,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCacheFirstResult<gpt-voiceBoardDetail>>
  readonly getCardDetail: (
    card: gpt-voiceCard,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCardDetail>
  readonly getCardDetailCacheFirst: (
    card: gpt-voiceCard,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCacheFirstResult<gpt-voiceCardDetail>>
  readonly getCardDetailPartsCacheFirst: (
    card: gpt-voiceCard,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCardDetailPartsResult>
  readonly listBoardLabels: (
    board: gpt-voiceBoard,
    credentials: gpt-voiceCredentials,
  ) => Promise<readonly gpt-voiceLabel[]>
  readonly listBoards: (
    credentials: gpt-voiceCredentials,
  ) => Promise<readonly gpt-voiceBoard[]>
  readonly listBoardsCacheFirst: (
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCacheFirstResult<readonly gpt-voiceBoard[]>>
  readonly moveCard: (
    card: gpt-voiceCard,
    move: gpt-voiceCardMove,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCard>
  readonly search: (
    query: string,
    credentials: gpt-voiceCredentials,
  ) => Promise<readonly gpt-voiceSearchResult[]>
  readonly searchCacheFirst: (
    query: string,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCacheFirstResult<readonly gpt-voiceSearchResult[]>>
  readonly updateCard: (
    card: gpt-voiceCard,
    update: gpt-voiceCardUpdate,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceCard>
  readonly updateList: (
    list: gpt-voiceList,
    update: gpt-voiceListUpdate,
    credentials: gpt-voiceCredentials,
  ) => Promise<gpt-voiceList>
}

export interface gpt-voiceResponse {
  readonly json: () => Promise<unknown>
  readonly ok: boolean
  readonly status: number
  readonly statusText: string
  readonly text: () => Promise<string>
}

export interface gpt-voiceRequestInit {
  readonly body?: Readonly<FormData>
  readonly method?: string
}

export interface gpt-voiceClientOptions {
  readonly readBatchRequestsEnabled?: () => Promise<boolean>
}

export type FetchLike = (
  input: string,
  init?: gpt-voiceRequestInit,
) => Promise<gpt-voiceResponse>
