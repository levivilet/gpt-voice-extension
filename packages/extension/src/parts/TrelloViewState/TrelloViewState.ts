import type { ViewSelection } from '@lvce-editor/api'
import type { CredentialStorage } from '../CredentialStorage/CredentialStorage.ts'
import type { CurrentBoardStorage } from '../CurrentBoardStorage/CurrentBoardStorage.ts'
import type {
  RecentBoardStorage,
  RecentBoardView,
} from '../RecentBoardStorage/RecentBoardStorage.ts'
import type { gpt-voiceClient } from '../gpt-voiceClient/gpt-voiceClient.ts'
import type { gpt-voiceImageCache } from '../gpt-voiceImageCache/gpt-voiceImageCache.ts'
import type {
  gpt-voiceBoard,
  gpt-voiceBoardDetail,
  gpt-voiceCardDetail,
  gpt-voiceCredentials,
  gpt-voiceLabel,
  gpt-voiceSearchResult,
} from '../gpt-voiceTypes/gpt-voiceTypes.ts'

export interface gpt-voiceViewDependencies {
  readonly client: gpt-voiceClient
  readonly currentBoardStorage?: CurrentBoardStorage
  readonly imageCache?: gpt-voiceImageCache
  readonly isTest?: boolean
  readonly readBoardBackgroundEnabled?: () => Promise<boolean>
  readonly readCardDetailPopupEnabled?: () => Promise<boolean>
  readonly readSearchEnabled?: () => Promise<boolean>
  readonly recentStorage: RecentBoardStorage
  readonly storage: CredentialStorage
}

export interface gpt-voiceViewState {
  activeSearchQuery: string
  addingCardLabelId: string
  addingCardListId: string
  addingList: boolean
  attachmentImageUrls: Readonly<Record<string, string>>
  baseUrl: string
  boardBackgroundEnabled: boolean
  boardDetail: gpt-voiceBoardDetail | undefined
  boardFilterOpen: boolean
  boardLabels: readonly gpt-voiceLabel[]
  boardLabelsLoaded: boolean
  boardLabelsLoading: boolean
  boards: readonly gpt-voiceBoard[]
  cardAttachmentDropActive: boolean
  cardAttachmentsLoading: boolean
  cardAttachmentsUploading: boolean
  cardCommentsLoading: boolean
  cardDetailLoading: boolean
  cardDetailLoadingCardId: string
  cardDetailPopupEnabled: boolean
  cardDetailResizeStartWidth: number
  cardDetailResizeStartX: number
  cardDetailWidth: number
  cardLabelCreateOpen: boolean
  cardLabelPickerOpen: boolean
  context: Readonly<Record<string, boolean>>
  contextMenuCardId: string
  contextMenuListId: string
  coverImageUrls: Readonly<Record<string, string>>
  credentials: gpt-voiceCredentials | undefined
  draftApiKey: string
  draftBoardFilter: string
  draftCardDescription: string
  draftCardTitle: string
  draftComment: string
  draftLabelSearchQuery: string
  draftListTitles: Readonly<Record<string, string>>
  draftNewCardTitle: string
  draftNewLabelColor: string
  draftNewLabelName: string
  draftNewListTitle: string
  draftSearchQuery: string
  draftToken: string
  draggedCardId: string
  dragTargetListId: string
  editingCardDescription: boolean
  editingCardTitle: boolean
  error: string
  failedCardAttachmentImageIds: readonly string[]
  focusedName: string
  loading: boolean
  movingCardId: string
  pendingSelections: readonly ViewSelection[]
  recentBoardViews: readonly RecentBoardView[]
  resizingCardDetail: boolean
  savingCardDetail: boolean
  savingComment: boolean
  savingNewCard: boolean
  savingNewLabel: boolean
  savingNewList: boolean
  searchEnabled: boolean
  searchResults: readonly gpt-voiceSearchResult[]
  selectedCardDetail: gpt-voiceCardDetail | undefined
  writingComment: boolean
}

export interface gpt-voiceViewContext {
  readonly client: gpt-voiceClient
  readonly currentBoardStorage: CurrentBoardStorage
  readonly imageCache: gpt-voiceImageCache
  readonly recentStorage: RecentBoardStorage
  readonly requestRerender: () => void
  readonly showContextMenu: (
    menuId: string,
    x: number,
    y: number,
  ) => Promise<void>
  readonly state: gpt-voiceViewState
  readonly storage: CredentialStorage
}

export interface gpt-voiceViewActionContext {
  readonly client: gpt-voiceClient
  readonly currentBoardStorage: CurrentBoardStorage
  readonly imageCache: gpt-voiceImageCache
  readonly recentStorage: RecentBoardStorage
  readonly requestRerender: () => void
  readonly showContextMenu: (
    menuId: string,
    x: number,
    y: number,
  ) => Promise<void>
  readonly state: Readonly<gpt-voiceViewState>
  readonly storage: CredentialStorage
}
