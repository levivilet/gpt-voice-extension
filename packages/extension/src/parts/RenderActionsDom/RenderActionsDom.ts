import {
  AriaRoles,
  type VirtualDomNode,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import type { gpt-voiceViewState } from '../gpt-voiceViewState/gpt-voiceViewState.ts'
import * as DomEventListenerFunctions from '../DomEventListenerFunctions/DomEventListenerFunctions.ts'
import * as MergeClassNames from '../MergeClassNames/MergeClassNames.ts'
import * as gpt-voiceStrings from '../gpt-voiceStrings/gpt-voiceStrings.ts'

interface ViewAction {
  readonly command: string
  readonly icon: string
  readonly title: string
}

const actionBackToBoards: ViewAction = {
  command: 'gpt-voice.backToBoards',
  icon: 'ArrowLeft',
  title: gpt-voiceStrings.backToBoards(),
}

const actionRefreshBoards: ViewAction = {
  command: 'gpt-voice.refreshBoards',
  icon: 'Refresh',
  title: gpt-voiceStrings.refreshBoards(),
}

const actionSignOut: ViewAction = {
  command: 'gpt-voice.logout',
  icon: 'Account',
  title: gpt-voiceStrings.signOut(),
}

const renderAction = (action: ViewAction): readonly VirtualDomNode[] => {
  return [
    {
      childCount: 1,
      className: 'IconButton',
      'data-command': action.command,
      title: action.title,
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames(
        'MaskIcon',
        `MaskIcon${action.icon}`,
      ),
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ]
}

const renderBoardFilterAction = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { boardFilterOpen, draftBoardFilter } = state
  return [
    {
      'aria-expanded': boardFilterOpen,
      'aria-label': gpt-voiceStrings.filterCards(),
      childCount: 1,
      className: draftBoardFilter
        ? MergeClassNames.mergeClassNames(
            'IconButton',
            'gpt-voiceBoardFilterActionActive',
          )
        : 'IconButton',
      name: 'openBoardFilter',
      onClick: DomEventListenerFunctions.HandleClick,
      title: gpt-voiceStrings.filterCards(),
      type: VirtualDomElements.Button,
    },
    {
      childCount: 0,
      className: MergeClassNames.mergeClassNames('MaskIcon', 'MaskIconFilter'),
      role: AriaRoles.None,
      type: VirtualDomElements.Div,
    },
  ]
}

export const renderActionsDom = (
  state: Readonly<gpt-voiceViewState>,
): readonly VirtualDomNode[] => {
  const { boardDetail, credentials } = state
  if (!credentials) {
    return []
  }
  const actions = boardDetail
    ? [
        renderAction(actionBackToBoards),
        renderAction(actionRefreshBoards),
        renderBoardFilterAction(state),
        renderAction(actionSignOut),
      ]
    : [renderAction(actionRefreshBoards), renderAction(actionSignOut)]
  return [
    {
      childCount: actions.length,
      className: 'Actions',
      role: AriaRoles.ToolBar,
      type: VirtualDomElements.Div,
    },
    ...actions.flat(),
  ]
}
