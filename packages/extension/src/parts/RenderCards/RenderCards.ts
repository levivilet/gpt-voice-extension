import {
  text,
  VirtualDomElements,
  type VirtualDomNode,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import { getAssetUrl } from '../AssetBaseUrl/AssetBaseUrl.ts'
import { getCardCoverImageUrl } from '../CardCoverHelpers/CardCoverHelpers.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import {
  getLabelColorClassName,
  getLabelText,
} from '../LabelHelpers/LabelHelpers.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

const getCardCommentCount = (card: Readonly<gpt-voiceCard>): number => {
  return card.badges?.comments || 0
}

const getCardCommentLabel = (count: number): string => {
  if (count === 1) {
    return gpt-voiceStrings.cardComment()
  }
  return gpt-voiceStrings.cardComments(count)
}

const renderCardCommentIcon = (baseUrl: string): VirtualDomNode => {
  return {
    alt: '',
    'aria-hidden': true,
    childCount: 0,
    className: 'gpt-voiceCardCommentIcon',
    src: getAssetUrl(baseUrl, 'media/comments.svg'),
    type: VirtualDomElements.Img,
  }
}

const renderCardCommentCount = (
  baseUrl: string,
  card: Readonly<gpt-voiceCard>,
): readonly VirtualDomNode[] => {
  const commentCount = getCardCommentCount(card)
  if (commentCount <= 0) {
    return []
  }
  const commentLabel = getCardCommentLabel(commentCount)
  return [
    {
      'aria-label': commentLabel,
      childCount: 2,
      className: 'gpt-voiceCardMeta',
      title: commentLabel,
      type: VirtualDomElements.Div,
    },
    renderCardCommentIcon(baseUrl),
    {
      childCount: 1,
      className: 'gpt-voiceCardCommentCount',
      type: VirtualDomElements.Span,
    },
    text(String(commentCount)),
  ]
}

const renderCardLabel = (
  label: NonNullable<gpt-voiceCard['labels']>[number],
): VirtualDomNode => {
  const labelText = getLabelText(label)
  return {
    'aria-label': labelText,
    childCount: 0,
    className: MergeClassNames.mergeClassNames(
      'gpt-voiceCardLabel',
      'gpt-voiceCardPreviewLabel',
      getLabelColorClassName(label.color),
    ),
    title: labelText,
    type: VirtualDomElements.Div,
  }
}

const renderCardLabels = (
  card: Readonly<gpt-voiceCard>,
): readonly VirtualDomNode[] => {
  const { labels } = card
  if (!labels || labels.length === 0) {
    return []
  }
  return [
    {
      childCount: labels.length,
      className: MergeClassNames.mergeClassNames(
        'gpt-voiceCardLabels',
        'gpt-voiceCardPreviewLabels',
      ),
      type: VirtualDomElements.Div,
    },
    ...labels.map(renderCardLabel),
  ]
}

const renderCardCover = (
  coverImageUrl: string,
  cardName: string,
): readonly VirtualDomNode[] => {
  if (!coverImageUrl) {
    return []
  }
  return [
    {
      alt: gpt-voiceStrings.cardCover(cardName),
      childCount: 0,
      className: 'gpt-voiceCardCoverImage',
      src: coverImageUrl,
      type: VirtualDomElements.Img,
    },
  ]
}

const renderCard = (
  baseUrl: string,
  coverImageUrls: Readonly<Record<string, string>>,
  card: Readonly<gpt-voiceCard>,
): readonly VirtualDomNode[] => {
  const coverSourceUrl = getCardCoverImageUrl(card)
  const coverImageUrl = coverSourceUrl ? coverImageUrls[coverSourceUrl] : ''
  const labelDom = renderCardLabels(card)
  const commentDom = renderCardCommentCount(baseUrl, card)
  const coverDom = renderCardCover(coverImageUrl, card.name)
  const bodyChildCount =
    1 + (labelDom.length > 0 ? 1 : 0) + (commentDom.length > 0 ? 1 : 0)
  return [
    {
      childCount: coverDom.length > 0 ? 2 : 1,
      className: coverImageUrl
        ? MergeClassNames.mergeClassNames('gpt-voiceCard', 'gpt-voiceCardWithCover')
        : 'gpt-voiceCard',
      draggable: true,
      name: `card:${card.id}`,
      onContextMenu: DomEventListenerFunctions.HandleContextMenu,
      onDragEnd: DomEventListenerFunctions.HandleDragEnd,
      onDragStart: DomEventListenerFunctions.HandleDragStart,
      type: VirtualDomElements.Button,
    },
    ...coverDom,
    {
      childCount: bodyChildCount,
      className: 'gpt-voiceCardBody',
      type: VirtualDomElements.Div,
    },
    ...labelDom,
    {
      childCount: 1,
      className: 'gpt-voiceCardTitle',
      type: VirtualDomElements.Div,
    },
    text(card.name),
    ...commentDom,
  ]
}

export const renderCards = (
  baseUrl: string,
  coverImageUrls: Readonly<Record<string, string>>,
  cards: readonly gpt-voiceCard[],
): readonly VirtualDomNode[] => {
  if (cards.length === 0) {
    return [text(gpt-voiceStrings.noCards())]
  }
  return cards.flatMap((card) => renderCard(baseUrl, coverImageUrls, card))
}
