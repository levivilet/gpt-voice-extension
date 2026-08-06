// cspell:ignore prefs

export interface gpt-voiceCredentials {
  readonly apiKey: string
  readonly token: string
}

export interface gpt-voiceOrganization {
  readonly displayName?: string
  readonly id: string
  readonly name: string
}

export interface gpt-voiceBoardBackgroundImage {
  readonly height?: number
  readonly url?: string
  readonly width?: number
}

export interface gpt-voiceBoardPreferences {
  readonly backgroundBottomColor?: string
  readonly backgroundBrightness?: string
  readonly backgroundColor?: string
  readonly backgroundImage?: string | null
  readonly backgroundImageScaled?: readonly gpt-voiceBoardBackgroundImage[]
  readonly backgroundTile?: boolean
  readonly backgroundTopColor?: string
}

export interface gpt-voiceBoard {
  readonly dateLastView?: string
  readonly id: string
  readonly idOrganization?: string
  readonly name: string
  readonly organization?: gpt-voiceOrganization
  readonly prefs?: gpt-voiceBoardPreferences
  readonly url?: string
}

export interface gpt-voiceLabel {
  readonly color?: string
  readonly id: string
  readonly idBoard?: string
  readonly name?: string
}

export interface gpt-voiceLabelCreate {
  readonly color: string
  readonly name: string
}

export interface gpt-voiceCardBadges {
  readonly comments?: number
}

export interface gpt-voiceCardCoverScaled {
  readonly height?: number
  readonly url?: string
  readonly width?: number
}

export interface gpt-voiceCardCover {
  readonly color?: string | null
  readonly scaled?: readonly gpt-voiceCardCoverScaled[]
  readonly sharedSourceUrl?: string | null
  readonly size?: string
  readonly url?: string | null
}

export interface gpt-voiceCard {
  readonly attachments?: readonly gpt-voiceAttachment[]
  readonly badges?: gpt-voiceCardBadges
  readonly cover?: gpt-voiceCardCover | null
  readonly desc?: string
  readonly id: string
  readonly idBoard?: string
  readonly idList?: string
  readonly labels?: readonly gpt-voiceLabel[]
  readonly name: string
  readonly url?: string
}

export interface gpt-voiceAttachmentPreview {
  readonly url?: string
}

export interface gpt-voiceAttachment {
  readonly id: string
  readonly mimeType?: string
  readonly name?: string
  readonly previews?: readonly gpt-voiceAttachmentPreview[]
  readonly url?: string
}

export interface gpt-voiceCommentData {
  readonly text?: string
}

export interface gpt-voiceCommentMember {
  readonly avatarHash?: string
  readonly avatarUrl?: string
  readonly fullName?: string
  readonly id?: string
  readonly initials?: string
  readonly username?: string
}

export interface gpt-voiceComment {
  readonly data: gpt-voiceCommentData
  readonly date?: string
  readonly id: string
  readonly memberCreator?: gpt-voiceCommentMember
}

export interface gpt-voiceCardDetail {
  readonly attachments: readonly gpt-voiceAttachment[]
  readonly card: gpt-voiceCard
  readonly comments: readonly gpt-voiceComment[]
}

export interface gpt-voiceCardUpdate {
  readonly desc: string
  readonly name: string
}

export interface gpt-voiceCardCreate {
  readonly name: string
  readonly pos: 'bottom'
}

export interface gpt-voiceCardMove {
  readonly idList: string
  readonly pos: 'bottom' | 'top'
}

export interface gpt-voiceList {
  readonly cards: readonly gpt-voiceCard[]
  readonly id: string
  readonly name: string
}

export interface gpt-voiceListCreate {
  readonly name: string
  readonly pos: 'bottom'
}

export interface gpt-voiceListUpdate {
  readonly name: string
}

export interface gpt-voiceBoardDetail {
  readonly board: gpt-voiceBoard
  readonly lists: readonly gpt-voiceList[]
}

export interface gpt-voiceBoardSearchResult extends gpt-voiceBoard {
  readonly type: 'board'
}

export interface gpt-voiceCardSearchResult extends gpt-voiceCard {
  readonly type: 'card'
}

export type gpt-voiceSearchResult =
  | gpt-voiceBoardSearchResult
  | gpt-voiceCardSearchResult
