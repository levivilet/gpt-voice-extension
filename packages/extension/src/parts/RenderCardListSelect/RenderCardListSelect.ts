import { text, VirtualDomElements } from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceCard } from '../gpt-voiceTypes/gpt-voiceTypes.ts'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import type { VirtualDomSegment } from '../VirtualDomSegment/VirtualDomSegment.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import { getCardListId } from '../GetCardListId/GetCardListId.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import { renderCardListOption } from '../RenderCardListOption/RenderCardListOption.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

export const renderCardListSelect = (
  state: Readonly<gpt-voiceViewState>,
  card: Readonly<gpt-voiceCard>,
): VirtualDomSegment => {
  const { boardDetail, movingCardId } = state
  const lists = boardDetail?.lists || []
  if (lists.length === 0) {
    return { childCount: 0, dom: [] }
  }
  const selectedListId = getCardListId(state, card)
  return {
    childCount: 1,
    dom: [
      {
        childCount: 2,
        className: 'gpt-voiceCardListSection',
        type: VirtualDomElements.Div,
      },
      {
        childCount: 1,
        className: 'gpt-voiceCardListLabel',
        type: VirtualDomElements.Label,
      },
      text(gpt-voiceStrings.list()),
      {
        childCount: lists.length,
        className: MergeClassNames.mergeClassNames(
          'gpt-voiceInput',
          'gpt-voiceCardListSelect',
        ),
        disabled: movingCardId === card.id,
        name: `cardList:${card.id}`,
        onInput: DomEventListenerFunctions.HandleInput,
        type: VirtualDomElements.Select,
        value: selectedListId,
      },
      ...lists.flatMap((list) => renderCardListOption(list, selectedListId)),
    ],
  }
}
