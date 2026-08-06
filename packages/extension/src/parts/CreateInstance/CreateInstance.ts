import type {
  ViewContext,
  ViewSelection,
  VirtualDomViewInstance,
} from '@lvce-editor/api'
import {
  type VirtualDomNode,
  text,
  VirtualDomElements,
} from '@lvce-editor/virtual-dom-worker'
import { getTitle } from '../GetTitle/GetTitle.ts'
import { type MenuEntry } from '../MenuEntries/MenuEntries.ts'

export interface ActiveTrelloViewInstance extends VirtualDomViewInstance {
  readonly getContext: () => Readonly<Record<string, boolean>>
  readonly getCss: () => string
  readonly getMenuEntries: (menuId: string) => readonly MenuEntry[]

  readonly renderTitle: () => string
}

const render = (): readonly VirtualDomNode[] => {
  return [
    {
      type: VirtualDomElements.Div,
      chiltCount: 1,
      className: 'gpt-voice',
    },
    text('hello world'),
  ]
}

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveTrelloViewInstance> => {
  const state = {}

  setTimeout(() => {
    context?.requestRerender()
  }, 100)

  const instance: ActiveTrelloViewInstance = {
    getContext() {
      return {}
    },
    getMenuEntries() {
      return []
    },
    getCss() {
      return ''
    },
    render,
    renderActionsDom(): readonly VirtualDomNode[] {
      return [
        {
          type: VirtualDomElements.Div,
          chiltCount: 1,
          className: 'main',
        },
        text('hello world'),
      ]
    },
    renderFocus(
      oldContext: Readonly<Record<string, boolean>>,
      newContext: Readonly<Record<string, boolean>>,
    ): string {
      return '.main'
    },
    renderSelections(): readonly ViewSelection[] {
      return []
    },
    renderTitle(): string {
      return getTitle(state)
    },

    saveState(): unknown {
      return {}
    },
  }
  return instance
}
