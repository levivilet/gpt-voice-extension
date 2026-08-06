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

const activeInstances = new Set<ActiveTrelloViewInstance>()

export const createInstance = async (
  context?: ViewContext,
): Promise<ActiveTrelloViewInstance> => {
  const state = {}

  const requestRerender = (): void => {
    // @ts-ignore
    const request = context?.requestRerender
    if (!request) {
      return
    }
    globalThis.setTimeout(() => {
      void request()
    }, 0)
  }

  const initialize = async (rerender: boolean): Promise<void> => {}

  await initialize(false)

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
    render(): readonly VirtualDomNode[] {
      return [
        {
          type: VirtualDomElements.Div,
          chiltCount: 1,
          className: 'main',
        },
        text('hello world'),
      ]
    },
    renderActionsDom(): readonly VirtualDomNode[] {
      return [text('hello world')]
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
  activeInstances.add(instance)
  return instance
}
